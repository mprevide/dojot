const redis = require('redis');

class RedisExpireMgmt {
  /**
     * @constructor
     */
  constructor() {
    this.db = 0;
    //   this.expirationMap = new Map();
    this.clients = {
      // pub: redis.createClient(this.config),
      sub: redis.createClient({
        host: 'redis',
        port: 6379,
        // db: 1
      }),
    };
  }

  /**
   * Initializes Subscribe
   * @returns Returns a Promise that, when resolved, will have been subscribed
   *          to the Redis event channel.
   */
  async initSubscribe() {
    // TODO: improve handle errors
    this.clients.sub.on('error', (error) => {
      console.error(`sub: onError: ${error}`);
    });
    this.clients.sub.on('end', (error) => {
      console.log(`sub: onEnd: ${error}`);
    });
    this.clients.sub.on('warning', (error) => {
      console.log(`sub: onWarning: ${error}`);
    });

    this.clients.sub.on('connect', (error) => {
      if (error) {
        console.error(`sub: Error on connect: ${error}`);
      } else {
        console.log('sub: Connect');
      }
    });

    return new Promise((resolve, reject) => {
      // Subscribe to the "notify-keyspace-events" channel used for expired type events in a db
      this.clients.sub.subscribe(`__keyevent@${this.db}__:expired`, (error) => {
        if (error) {
          console.error(`Error on connect: ${error}`);
          return reject(error);
        }
        console.log(`Subscribed to __keyevent@${this.db}__:expired event channel`);
        this.clients.sub.on('message', (chan, idConnection) => this.onMessage(chan, idConnection));
        return resolve();
      });

      this.clients.sub.subscribe(`__keyevent@${this.db}__:del`, (error) => {
        if (error) {
          console.error(`Error on connect: ${error}`);
          return reject(error);
        }
        console.log(`Subscribed to __keyevent@${this.db}__:del event channel`);
        this.clients.sub.on('message', (chan, idConnection) => this.onMessage(chan, idConnection));
        return resolve();
      });
    });
  }

  /**
   * It is called when the on message event happens in the sub
   *
   * @private
   * @param {*} chan
   * @param {*} idConnection
   */
  onMessage(chan, idConnection) {
    // this.clients.sub.get(idConnection, (err, data) => {
    //         if(err){
    //             console.log('err',err);
    //         }

    //         if(data){
    //             console.log('data',data);
    //         }
    //   })
    // if (this.expirationMap.has(idConnection)) {
    console.log(`onMessage: ${idConnection} ${chan}`);
    // this.expirationMap.get(idConnection)();
    // } else {
    //   logger.warn(`onMessage: ${idConnection} doesn't exist`);
    // }
  }
}

module.exports = RedisExpireMgmt;
