

module.exports = function (session) {
  const { Store } = session;


  class RedisStore extends Store {
    constructor(options = {}) {
      super(options);
      this.sessionRedis = options.redis;
    }

    // Required
    async get(sid, cb = () => {}) {
      try {
        const data = await this.sessionRedis.get(sid);
        return cb(null, data);
      } catch (err) {
        return cb(err);
      }
    }

    // Required
    async set(sid, sess, cb = () => {}) {
      console.log('RedisStore set data sid sess', sid, sess);
      try {
        await this.sessionRedis.set(sid, sess);
        return cb(null, 'OK');
      } catch (er) {
        return cb(er);
      }
    }

    // Required
    // This required method is used to destroy/delete a session from the store given a session ID (sid). The callback should be called as callback(error) once the session is destroye
    async destroy(sid, cb = () => {}) {
      console.log('RedisStore destroy sid', sid);
      try {
        await this.sessionRedis.destroy(sid);
        return cb(null, 'OK');
      } catch (er) {
        return cb(er);
      }
    }

    async touch(sid, sess, cb = () => {}) {
      console.log('RedisStore touch sid', sid);
      try {
        const ret = await this.sessionRedis.touch(sid);
        if (!ret) {
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
