const redis = require('redis');
const RedisManagement = require('./RedisManagement');

/**
 * Wrapper for Redis
 */
 class Redis {
    /**
     * @constructor
     *
     * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
     *          with register service 'redis'} serviceState
     *          Manages the services' states, providing health check and shutdown utilities.
    */
    constructor(serviceState) {
        this.redisClient = redis.createClient({
            host: 'redis',
            port: 6379,
            // db: 1
        });
        this.redisSub = redis.createClient({
            host: 'redis',
            port: 6379,
            // db: 1
        });
        this.serviceState = serviceState;
        this.isHealth = null;
        this.management = new RedisManagement(this.redisClient, this.redisSub);
    }

    async init(){
        await this.management.initSub();
    }

    /**
    *  Returns a RedisManagement instance
    * @returns {RedisManagement}
    */
    getManagementInstance() {
        return this.management;
    }



//      /**
//    * Creates a 'healthCheck' for influxDB
//    *
//    * @param {function()} cbHealth Callback to be called if the service is
//    *                              healthy, this.isHealth is not null
//    *                              and if the value of this.isHealth will be changed.
//    * @param {function()} cbNotHealth Callback to be called if the service is
//    *                                 not healthy,  this.isHealth is not null
//    *                                 and if the value of this.isHealth will be changed.
//    */
//   createHealthChecker(cbHealth, cbNotHealth) {
//     const influxdbHealthChecker = async (signalReady, signalNotReady) => {
//       const isHealth = await this.influxState.isHealth();
//       if (isHealth) {
//         logger.debug('createHealthChecker: InfluxDB is healthy');
//         if (this.isHealth !== null && !this.isHealth) {
//           logger.info('createHealthChecker: Calling callback health');
//           cbHealth();
//         }
//         this.isHealth = true;
//         signalReady();
//       } else {
//         logger.warn('createHealthChecker: InfluxDB is not healthy');
//         if (this.isHealth !== null && this.isHealth) {
//           logger.warn('createHealthChecker: Calling callback not health');
//           cbNotHealth();
//         }
//         this.isHealth = false;
//         signalNotReady();
//       }
//     };
//     this.serviceState.addHealthChecker('influxdb', influxdbHealthChecker, configInflux['heathcheck.ms']);
//   }


//   /**
//    *  Registers a shutdown to the http server
//    */
//   async registerShutdown() {
//     this.serviceState.registerShutdownHandler(async () => {
//       logger.debug('ShutdownHandler: Trying close all writer...');
//       await this.influxDataWriter.closeAll();
//       logger.warn('ShutdownHandler: Closed all writer.');
//     });
//   }
}

module.exports = Redis;