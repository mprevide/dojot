
const { promisify } = require('util');

class RedisSessionMgmt {
  constructor(redisClient, redisSub) {
    this.prefixSession = 'session:';
    this.prefixSessionTTL = 'session-ttl:';
    this.prefixSessionTTLSize = (this.prefixSessionTTL).length;

    this.redisClient = redisClient;
    this.redisSub = redisSub;

    this.redisClientAsync = {
      get: promisify(this.redisClient.get).bind(this.redisClient),
      set: promisify(this.redisClient.set).bind(this.redisClient),
      expire: promisify(this.redisClient.expire).bind(this.redisClient),
      del: promisify(this.redisClient.del).bind(this.redisClient),
    };

    this.redisSubAsync = {
      subscribe: promisify(this.redisSub.subscribe).bind(this.redisSub),
    };

    this.db = 0;
    this.maxLifetime = 86400; // One day in seconds.
    this.maxIdle = 1800; // 1800; // 30 minutes in seconds.
    this.subIsInit = false;
    // Activate "notify-keyspace-events" for expired type events
    this.redisClient.send_command('config', ['set', 'notify-keyspace-events', 'Ex']);
  }

  async initSub() {
    // TODO: improve handle errors
    // TODO: retry
    this.redisSub.on('error', (error) => {
      console.error(`sub: onError: ${error}`);
    });
    this.redisSub.on('end', (error) => {
      console.log(`sub: onEnd: ${error}`);
    });
    this.redisSub.on('warning', (error) => {
      console.log(`sub: onWarning: ${error}`);
    });

    this.redisSub.on('connect', (error) => {
      if (error) {
        console.error(`sub: Error on connect: ${error}`);
      } else {
        console.log('sub: Connect');
      }
    });
    try {
      await this.redisSubAsync.subscribe(`__keyevent@${this.db}__:expired`);
      this.redisSub.on('message', (chan, idConnection) => this.onMessage(chan, idConnection));
    } catch (err) {
      console.log(err);
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
  async onMessage(chan, key) {
    try {
      if (key.substring(0, this.prefixSessionTTLSize) === this.prefixSessionTTL) {
        const sid = key.slice(this.prefixSessionTTLSize);
        console.log(`onMessage: ${key}, ${sid} ,${chan}`);
        await this.redisClientAsync.del(this.prefixSession + sid);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async get(sid) {
    try {
      const key = this.prefixSession + sid;
      const data = await this.redisClientAsync.get(key);
      console.log(data);
      const result = JSON.parse(data);
      return result;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  // Required
  async set(sid, sess) {
    console.log('RedisStore set data sid sess', sid, sess);
    try {
      const value = JSON.stringify(sess);
      await this.redisClientAsync.set(this.prefixSession + sid, value);
      await this.redisClientAsync.expire(this.prefixSession + sid, this.maxLifetime);
      await this.redisClientAsync.set(this.prefixSessionTTL + sid, 'TEST');
      await this.redisClientAsync.expire(this.prefixSessionTTL + sid, this.maxIdle);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async destroy(sid) {
    console.log('RedisStore destroy sid', sid);
    // const key = this.prefixSession + sid;
    // this.redisClient.del(key, cb);
    // this.redisClient.del(this.prefixSessionTTL + sid, cb);
    try {
      await this.redisClientAsync.del(this.prefixSession + sid);
      await this.redisClientAsync.del(this.prefixSessionTTL + sid);
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async restartIdleTTL(sid) {
    console.log('RedisStore touch sid', sid);
    try {
      const ret = await this.redisClientAsync.expire(this.prefixSessionTTL + sid, this.maxIdle);
      if (ret !== 1) {
        return false;
      }
      return true;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
}

module.exports = RedisSessionMgmt;
