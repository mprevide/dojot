const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');

const { session_redis: sessionRedisConfig } = getConfig('BACKSTAGE');

const logger = new Logger('backstage:Redis/RedisSessionMgmt');
class RedisSessionMgmt {
  constructor(
    redisPub, redisSub,
  ) {
    this.prefixSession = 'session:';
    this.prefixSessionTTL = 'session-ttl:';
    this.prefixSessionTTLSize = (this.prefixSessionTTL).length;

    this.redisPub = redisPub;
    this.redisSub = redisSub;

    this.maxLifetime = sessionRedisConfig['max.life.time.sec'] || 86400; // One day in seconds.
    this.maxIdle = sessionRedisConfig['max.idle.time.sec'] || 1800; // 30 minutes in seconds.

    // Activate "notify-keyspace-events" for expired type events
    this.redisPub.send_command('config', ['set', 'notify-keyspace-events', 'Ex']);
  }

  /**
  * Initializes subscribe on expiration events in db passed as parameter
  *
  * @param {Number} db the redis db to listen for expiration event
  */
  async initSub(db = 0) {
    try {
      // subscribe on expiration events
      await this.redisSub.subscribe(`__keyevent@${db}__:expired`);
      // this.redisSub.on('message', (chan, key) => this.onExpiration(chan, key));
      // receives expiration messages onExpiration
      this.redisSub.on('message', this.onExpiration);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * It is called when the on message event happens in the sub
   *
   * @private
   * @param {*} chan
   * @param {*} key
   */
  async onExpiration(chan, key) {
    logger.debug(`onExpiration: ${key}, ${chan}`);
    try {
      if (key.substring(0, this.prefixSessionTTLSize) === this.prefixSessionTTL) {
        const sid = key.slice(this.prefixSessionTTLSize);
        logger.debug(`onExpiration: ${key}, ${sid} ,${chan}`);
        await this.redisPub.del(this.prefixSession + sid);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   *
   * @param {*} sid
   * @returns
   */
  async get(sid) {
    logger.debug(`get: sid=${sid}`);
    try {
      const key = this.prefixSession + sid;
      const data = await this.redisPub.get(key);
      const result = JSON.parse(data);
      return result;
    } catch (err) {
      logger.error('get:', err);
      throw err;
    }
  }

  /**
   *
   * @param {*} sid
   * @param {*} sess
   */
  async set(sid, sess) {
    logger.debug(`set: sid=${sid} sess=${JSON.stringify(sid)}`);
    try {
      const value = JSON.stringify(sess);
      await this.redisPub.set(this.prefixSession + sid, value);
      await this.redisPub.expire(this.prefixSession + sid, this.maxLifetime);
      await this.redisPub.set(this.prefixSessionTTL + sid, '');
      await this.redisPub.expire(this.prefixSessionTTL + sid, this.maxIdle);
    } catch (err) {
      logger.error('set:', err);
      throw err;
    }
  }

  /**
   *
   * @param {*} sid
   */
  async destroy(sid) {
    logger.debug(`destroy: sid=${sid}`);
    try {
      await this.redisPub.del(this.prefixSession + sid);
      await this.redisPub.del(this.prefixSessionTTL + sid);
    } catch (err) {
      logger.error('destroy:', err);
      throw err;
    }
  }

  async restartIdleTTL(sid) {
    // console.log('RedisStore touch sid', sid);
    try {
      const ret = await this.redisPub.expire(this.prefixSessionTTL + sid, this.maxIdle);
      if (ret !== 1) {
        return false;
      }
      return true;
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }
}

module.exports = RedisSessionMgmt;
