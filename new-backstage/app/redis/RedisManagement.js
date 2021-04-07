const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');

const { session: sessionRedisConfig } = getConfig('BACKSTAGE');

const logger = new Logger('backstage:Redis/RedisSessionMgmt');
class RedisSessionMgmt {
  constructor(
    redisPub, redisSub,
  ) {
    this.maxLifetime = sessionRedisConfig['redis.max.life.time.sec'] || 86400; // One day in seconds.
    this.maxIdle = sessionRedisConfig['redis.max.idle.time.sec'] || 1800; // 30 minutes in seconds.

    // `session` is a key created in redis with ttl with the value`this.maxLifetime`.
    // It is the maximum time for a session.
    this.prefixSession = 'session:';

    // `session-idle` is a key created in redis with ttl with
    // the value `this.maxIdle` in each request, this ttl is restarted.
    this.prefixSessionIdle = 'session-idle:';
    this.prefixSessionIdleSize = (this.prefixSessionIdle).length;

    this.redisPub = redisPub;
    this.redisSub = redisSub;

    const onExpiration = this.onExpiration.bind(this);
    // receives expiration messages onExpiration
    this.redisSub.on('message', onExpiration);
  }

  initPub() {
    logger.debug('initPub:');
    try {
      // Activate "notify-keyspace-events" for expired type events
      this.redisPub.send_command('config', ['set', 'notify-keyspace-events', 'Ex']);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
  * Initializes subscribe on expiration events in db passed as parameter
  *
  * @param {Number} db the redis db to listen for expiration event
  */
  async initSub(db = 0) {
    logger.debug(`initSub: db=${db}`);
    try {
      // subscribe on expiration events
      await this.redisSub.subscribe(`__keyevent@${db}__:expired`);
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  /**
   * It is called when the on message event happens in the sub.
   *
   * In this case the event will always expire and will
   * delete key {this.prefixSession + sid} and its value
   * sid is extracted from the key,
   * knowing that the key will be {this.prefixSessionTTL+sid}
   *
   * TODO: make the expiring action happen inside REDIS probably using a lua script
   *
   * @private
   * @param {string} channel
   * @param {string} key
   */
  async onExpiration(channel, key) {
    logger.debug(`onExpiration: key=${key}, channel=${channel}`);
    logger.debug(`onExpiration: this.prefixSessionTTLSize=${this.prefixSessionIdleSize}, this.prefixSessionTTL=${this.prefixSessionIdle}`);
    logger.debug(`onExpiration: key.substring(0, this.prefixSessionTTLSize)=${key.substring(0, this.prefixSessionIdleSize)}`);

    try {
      if (key.substring(0, this.prefixSessionIdleSize) === this.prefixSessionIdle) {
        const sid = key.slice(this.prefixSessionIdleSize);
        logger.debug(`onExpiration: sid=${sid}`);
        await this.redisPub.del(this.prefixSession + sid);
      }
    } catch (err) {
      logger.error(err);
    }
  }

  /**
   * This  method is used to get a value
   * from key {this.prefixSession + sid} on redis
   *
   * @param {string} sid  session ID
   *
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
   * This  method is used to set {sess}
   * into key {this.prefixSession + sid} with ttl {this.maxLifetime} and
   * to set a empty value
   * into key {this.prefixSessionTTL + sid} with ttl {this.maxIdle}
   * on redis
   *
   *
   * @param {string} sid  session ID
   * @param {object} sess  session ID
   */
  async set(sid, sess) {
    logger.debug(`set: sid=${sid} sess=${JSON.stringify(sid)}`);
    try {
      const value = JSON.stringify(sess);
      await this.redisPub.set(this.prefixSession + sid, value);
      await this.redisPub.expire(this.prefixSession + sid, this.maxLifetime);
      await this.redisPub.set(this.prefixSessionIdle + sid, '');
      await this.redisPub.expire(this.prefixSessionIdle + sid, this.maxIdle);
    } catch (err) {
      logger.error('set:', err);
      throw err;
    }
  }

  /**
   * This  method is used to delete
   * key {this.prefixSession + sid} and
   * key {this.prefixSessionTTL + sid} from redis
   *
   * @param {string} sid  session ID
   */
  async destroy(sid) {
    logger.debug(`destroy: sid=${sid}`);
    try {
      await this.redisPub.del(this.prefixSession + sid);
      await this.redisPub.del(this.prefixSessionIdle + sid);
      // TODO: destroy session in the keycloak by calling logout?
    } catch (err) {
      logger.error('destroy:', err);
      throw err;
    }
  }

  /**
   * This method is used to restore the ttl {this.maxIdle} into
   * key {this.prefixSessionTTL + sid} on redis
   *
   * @param {string} sid  session ID
   */
  async restartIdleTTL(sid) {
    logger.debug(`restartIdleTTL: sid=${sid}`);
    try {
      const ret = await this.redisPub.expire(this.prefixSessionIdle + sid, this.maxIdle);
      if (ret !== 1) {
        return false;
      }
      return true;
    } catch (err) {
      logger.error('restartIdleTTL:', err);
      throw err;
    }
  }
}

module.exports = RedisSessionMgmt;
