const redis = require('redis');
const { promisify } = require('util');

module.exports = function (session) {
  const { Store } = session;

  const redisClient = redis.createClient({
    host: 'redis',
    port: 6379,
  // db: 1
  });

  const redisSub = redis.createClient({
    host: 'redis',
    port: 6379,
  // db: 1
  });
  class RedisStore extends Store {
    constructor(options = {}) {
      super(options);

      this.prefixSession = 'session:';
      this.prefixSessionTTL = 'session-ttl:';

      this.redisClient = redisClient;
      this.redisSub = redisSub;

      this.redisClientAsync = {
        get: promisify(redisClient.get).bind(redisClient),
        set: promisify(redisClient.set).bind(redisClient),
        expire: promisify(redisClient.expire).bind(redisClient),
        del: promisify(redisClient.del).bind(redisClient),
      };

      this.redisSubAsync = {
        subscribe: promisify(redisSub.subscribe).bind(redisClient),
      };

      this.maxLifetime = 86400; // One day in seconds.
      this.maxIdle = 1800; // 30 minutes in seconds.
      this.subIsInit = false;

      // Activate "notify-keyspace-events" for expired type events
      this.redisClient.send_command('config', ['set', 'notify-keyspace-events', 'Ex']);
    }

    // Required
    async get(sid, cb = () => {}) {
      try {
        const key = this.prefixSession + sid;
        const data = await this.redisClientAsync.get(key);
        console.log(data);
        const result = JSON.parse(data);
        return cb(null, result);
      } catch (err) {
        return cb(err);
      }
    }

    // Required
    async set(sid, sess, cb = () => {}) {
      console.log('RedisStore set data sid sess', sid, sess);
      try {
        const value = JSON.stringify(sess);
        await this.redisClientAsync.set(this.prefixSession + sid, value);
        await this.redisClientAsync.expire(this.prefixSession + sid, this.maxLifetime);
        await this.redisClientAsync.set(this.prefixSessionTTL + sid, '');
        await this.redisClientAsync.expire(this.prefixSessionTTL + sid, this.maxIdle);
        return cb(null, 'OK');
      } catch (er) {
        return cb(er);
      }
    }

    // Required
    // This required method is used to destroy/delete a session from the store given a session ID (sid). The callback should be called as callback(error) once the session is destroye
    async destroy(sid, cb = () => {}) {
      console.log('RedisStore destroy sid', sid);
      // const key = this.prefixSession + sid;
      // this.redisClient.del(key, cb);
      // this.redisClient.del(this.prefixSessionTTL + sid, cb);
      try {
        await this.redisClientAsync.del(this.prefixSession + sid);
        await this.redisClientAsync.del(this.prefixSessionTTL + sid);

        return cb(null, 'OK');
      } catch (er) {
        return cb(er);
      }
    }

    async touch(sid, sess, cb = () => {}) {
      console.log('RedisStore touch sid', sid);
      try {
        const ret = await this.redisClientAsync.expire(this.prefixSessionTTL + sid, this.maxIdle);
        if (ret !== 1) {
          return cb(null, 'EXPIRED');
        }
        return cb(null, 'OK');
      } catch (er) {
        return cb(er);
      }
    }
  }

  return RedisStore;
};
