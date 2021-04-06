const redis = require('redis');
const { promisify } = require('util');
const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const RedisManagement = require('./RedisManagement');
const { replaceTLSFlattenConfigs } = require('../Utils');

const logger = new Logger('backstage:Redis');

const { redis: redisConfig } = getConfig('BACKSTAGE');


/**
 * A function that receives an options object as parameter including
 * the retry attempt, the total_retry_time indicating how much time passed
 * since the last time connected, the error why the connection was lost and
 * the number of times_connected in total. If you return a number from this function,
 * the retry will happen exactly after that time in milliseconds.
 *  If you return a non-number, no further retry will happen and all offline
 * commands are flushed with errors. Return an error to return that specific
 * error to all offline commands.
 *
 * @param {Object} options
 * @returns
 */
const retryStrategy = (options) => {
  logger.debug(`retryStrategy: options=${JSON.stringify(options)}`);

  // reconnect after
  return redisConfig['reconnect.after'];
};


/**
 * Wrapper for Redis
 */
class Redis {
  /**
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register services 'redis-pub' and 'redis-sub'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   */
  async init(serviceState) {
    try {
      const redisConfigReplaced = replaceTLSFlattenConfigs(redisConfig);

      this.redisPub = redis.createClient({
        retry_strategy: retryStrategy,
        ...redisConfigReplaced,
      });
      this.redisSub = redis.createClient({
        retry_strategy: retryStrategy,
        ...redisConfigReplaced,
      });

      this.serviceState = serviceState;

      this.createRedisAsync();

      this.management = new RedisManagement(
        this.redisPubAsync,
        this.redisSubAsync,
      );

      this.initSub = this.management.initSub.bind(this.management);
      this.initPub = this.management.initPub.bind(this.management);

      this.redisPub.on('connect', () => {
        logger.debug('Redis pub is connect.');
        this.serviceState.signalReady('redis-pub');
        this.initPub();
      });

      this.redisSub.on('connect', async () => {
        logger.debug('Redis sub is connect.');
        this.serviceState.signalReady('redis-sub');
        await this.initSub(redisConfig.db);
      });

      this.handleEvents(this.redisPub, 'pub', this.serviceState);
      this.handleEvents(this.redisSub, 'sub', this.serviceState);

      await this.registerShutdown();
      this.init = true;
    } catch (error) {
      logger.error('init: error=', error);
    }
  }

  /**
   * Checks whether it was started properly by calling the init method
   * @private
   */
  checkInitiated() {
    if (!this.init) {
      throw new Error('Call init method first');
    }
  }


  /**
 * Handles redis events and reflects them in the service state manager
 * @private
 *
 * @param {string} clientRedis
 * @param {string} nameClient
 */
  handleEvents(clientRedis, nameClient) {
    clientRedis.on('ready', () => {
      logger.info(`Redis ${nameClient} is ready.`);
      this.serviceState.signalReady(`redis-${nameClient}`);
    });
    clientRedis.on('error', (error) => {
      logger.error(`Redis ${nameClient} has an error:`, error);
      this.serviceState.signalNotReady(`redis-${nameClient}`);
    });
    clientRedis.on('end', () => {
      logger.warn(`Redis ${nameClient} was ended.`);
      this.serviceState.signalNotReady(`redis-${nameClient}`);
    });
    clientRedis.on('warning', (warning) => {
      logger.warn(`Redis ${nameClient} has an warning:`, warning);
    });
    clientRedis.on('reconnecting', () => {
      logger.warn(`Redis ${nameClient} is trying to reconnect...`);
      this.serviceState.signalNotReady(`redis-${nameClient}`);
    });
  }

  /**
   * Create an asynchronous version of the net methods that will be used
   * @private
   */
  createRedisAsync() {
    this.redisPubAsync = {
      get: promisify(this.redisPub.get).bind(this.redisPub),
      set: promisify(this.redisPub.set).bind(this.redisPub),
      expire: promisify(this.redisPub.expire).bind(this.redisPub),
      del: promisify(this.redisPub.del).bind(this.redisPub),
      ping: promisify(this.redisPub.ping).bind(this.redisPub),
      quit: promisify(this.redisPub.quit).bind(this.redisPub),
      send_command: (this.redisPub.send_command).bind(this.redisPub),
      exists: (this.redisPub.exists).bind(this.redisPub),
    };

    this.redisSubAsync = {
      subscribe: promisify(this.redisSub.subscribe).bind(this.redisSub),
      ping: promisify(this.redisSub.ping).bind(this.redisSub),
      quit: promisify(this.redisSub.quit).bind(this.redisSub),
      on: (this.redisSub.on).bind(this.redisSub),
      unsubscribe: promisify(this.redisSub.unsubscribe).bind(this.redisSub),
    };
  }

  /**
  * Returns a RedisManagement instance
  * @returns {RedisManagement}
  */
  getManagementInstance() {
    this.checkInitiated();
    return this.management;
  }

  /**
   * Registers a shutdown to the redis
   * @private
   */
  async registerShutdown() {
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close redis sub...');
      // TODO: I think things are not well organized unsubscribe here and subscribe in another class
      this.init = false;
      await this.redisSubAsync.unsubscribe();
      await this.redisSubAsync.quit();
      logger.warn('ShutdownHandler: Closed redis sub.');
    });
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close redis pub...');
      this.init = false;
      await this.redisPubAsync.quit();
      logger.warn('ShutdownHandler: Closed redis pub.');
    });
  }
}

module.exports = new Redis();
