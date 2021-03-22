const redis = require('redis')

module.exports = function (session) {
    const Store = session.Store

let redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
  // db: 1
});

    // All callbacks should have a noop if none provided for compatibility
    // with the most Redis clients.
    const noop = () => {}

    class RedisStore extends Store {
      constructor(options = {}) {
        super(options)
        // if (!options.client) {
        //   throw new Error('A client must be directly provided to the RedisStore')
        // }

        this.prefix = options.prefix == null ? 'sess:' : options.prefix
        this.serializer = options.serializer || JSON
        this.client = redisClient; //options.client
        this.ttl = options.ttl || 86400 // One day in seconds.
        this.disableTTL = options.disableTTL || false

        // Activate "notify-keyspace-events" for expired type events
        // this.client.send_command('config', ['set', 'notify-keyspace-events', 'Ex']);

      }

      //Required
      get(sid, cb = noop) {
        console.log('get',  this.prefix + sid);
        let key = this.prefix + sid

        this.client.get(key, (err, data) => {
          if (err) return cb(err)
          if (!data) return cb()

          let result
          try {
            result = this.serializer.parse(data)
          } catch (err) {
            return cb(err)
          }
          return cb(null, result)
        })
      }
  
      //Required
      set(sid, sess, cb = noop) {
        console.log('set',  this.prefix + sid);
        // let args = [this.prefix + sid]
  
        // let value
        // try {
        //   value = this.serializer.stringify(sess)
        // } catch (er) {
        //   return cb(er)
        // }
        // args.push(value)
        // if (!this.disableTTL) args.push('EX', this._getTTL(sess))
  
        // this.client.set(args, cb)
      }
  
      //Required
      //This required method is used to destroy/delete a session from the store given a session ID (sid). The callback should be called as callback(error) once the session is destroye
      destroy(sid, cb = noop) {
        // console.log('destroy');
        // let key = this.prefix + sid
        // this.client.del(key, cb)
      }

      // _getTTL(sess) {
      //   console.log('_getTTL');
      //   let ttl
      //   if (sess && sess.cookie && sess.cookie.expires) {
      //     let ms = Number(new Date(sess.cookie.expires)) - Date.now()
      //     ttl = Math.ceil(ms / 1000)
      //   } else {
      //     ttl = this.ttl
      //   }
      //   return ttl
      // }
    }

    return RedisStore
  }