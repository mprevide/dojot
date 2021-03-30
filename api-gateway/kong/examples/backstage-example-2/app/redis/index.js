const redis = require('redis');
const { promisify } = require('util');
const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const RedisManagement = require('./RedisManagement');

const RETRY_MS = 5000;
const logger = new Logger('backstage:Redis');

const { redis: redisConfig } = getConfig('BACKSTAGE');

// TODO
const MAX_ATTEMPT = 10;
const TOTAL_RETRY_TIME = 1000 * 60 * 60;
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
  // if (options.error && options.error.code === 'ECONNREFUSED') {
  //   // End reconnecting on a specific error and flush all commands with
  //   // a individual error
  //   return new Error('The server refused the connection');
  // }
  if (options.total_retry_time > TOTAL_RETRY_TIME) {
    // End reconnecting after a specific timeout and flush all commands
    // with a individual error
    return new Error('Retry time exhausted');
  }
  if (options.attempt > MAX_ATTEMPT) {
    // End reconnecting with built in error
    return undefined;
  }
  // reconnect after
  return RETRY_MS;
};

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
    this.redisPub = redis.createClient({
      retry_strategy: retryStrategy,
      ...redisConfig,
      // TODO
      // An object containing options to pass to [tls.connect]
      // (https://nodejs.org/api/tls.html#tls_tls_connect_port_host_options_callback)
      // to set up a TLS
      // tls: {
      //  key: fs.readFileSync('path_to_keyfile', encoding='ascii'),
      //  cert: fs.readFileSync('path_to_certfile', encoding='ascii'),
      //  ca: [ fs.readFileSync('path_to_ca_certfile', encoding='ascii') ]
      // }
    });
    this.redisSub = redis.createClient({
      retry_strategy: retryStrategy,
      ...redisConfig,
    });

    this.serviceState = serviceState;

    this.redisPubAsync = {
      get: promisify(this.redisPub.get).bind(this.redisPub),
      set: promisify(this.redisPub.set).bind(this.redisPub),
      expire: promisify(this.redisPub.expire).bind(this.redisPub),
      del: promisify(this.redisPub.del).bind(this.redisPub),
      ping: promisify(this.redisPub.ping).bind(this.redisPub),
      quit: promisify(this.redisPub.quit).bind(this.redisPub),
      send_command: (this.redisPub.send_command).bind(this.redisPub),
    };

    this.redisSubAsync = {
      subscribe: promisify(this.redisSub.subscribe).bind(this.redisSub),
      ping: promisify(this.redisSub.ping).bind(this.redisSub),
      quit: promisify(this.redisSub.quit).bind(this.redisSub),
      on: (this.redisSub.on).bind(this.redisSub),
    };

    this.management = new RedisManagement(
      this.redisPubAsync,
      this.redisSubAsync,
    );
  }

  async init() {
    this.handleEvents(this.redisPub, 'pub', this.serviceState);
    this.handleEvents(this.redisSub, 'sub', this.serviceState);
    await this.registerShutdown();
    await this.management.initSub(redisConfig.db);
  }

  /**
 *  TODO
 * @param {*} clientRedis
 * @param {*} nameClient
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
    clientRedis.on('connect', () => {
      logger.debug(`Redis ${nameClient} is connect.`);
      this.serviceState.signalReady(`redis-${nameClient}`);
    });
    clientRedis.on('reconnecting', () => {
      logger.warn(`Redis ${nameClient} is trying to reconnect...`);
      this.serviceState.signalNotReady(`redis-${nameClient}`);
    });
  }


  /**
    *  Returns a RedisManagement instance
    * @returns {RedisManagement}
    */
  getManagementInstance() {
    return this.management;
  }

  /**
   *  Registers a shutdown to the redis
   */
  async registerShutdown() {
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close redis sub...');
      await this.redisSubAsync.quit();
      logger.warn('ShutdownHandler: Closed redis sub.');
    });
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close redis pub...');
      await this.redisPubAsync.quit();
      logger.warn('ShutdownHandler: Closed redis pub.');
    });
  }
}

module.exports = Redis;
