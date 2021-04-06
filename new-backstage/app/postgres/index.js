const { Pool } = require('pg');
const promiseRetry = require('promise-retry');

const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');

const logger = new Logger('backstage:Postgres');

const { postgres_client: configClientPG, postgres: configPG } = getConfig('BACKSTAGE');

const tableName = 'user_config';

// https://github.com/TrentoCrowdAI/crowdai/blob/9e5481471b0454dfd870a6817f57bdf43d479f72/api/src/db/index.js

// pool: { min: 0, max: 10, acquireTimeoutMillis: 30000, idleTimeoutMillis: 30000 }
/**
 * Wrapper for Redis
 */
class Postgres {
  /**
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register service 'postgres'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   */
  async init(serviceState) {
    try {
      this.serviceState = serviceState;
      this.serviceName = 'postgres';
      this.pool = new Pool({
        // min: 0,
        // max: 10,
        // acquireTimeoutMillis: 30000,
        // idleTimeoutMillis: 30000,
        ...configClientPG,
      });
      this.handleEvents();
      this.client = await this.pool.connect();
      await this.checkTable();
      this.createHealthChecker();
      this.registerShutdown();
    } catch (error) {
      logger.error('init: error=', error);
      throw error;
    }
  }

  handleEvents() {
    this.pool.on('connect', (client) => {
      logger.warn('pg connected');
      this.serviceState.signalReady(this.serviceName);
    });

    // Whenever a client is checked out from the pool the pool will
    // emit the acquire event with the client that was acquired.
    this.pool.on('acquire', (client) => {
      logger.warn('pg acquired');
      // this.serviceState.signalNotReady(this.serviceName);
    });

    // Whenever a client is closed & removed from the pool
    // the pool will emit the remove event.
    this.pool.on('remove', (client) => {
      logger.warn('pg removed');
      this.serviceState.signalReady(this.serviceName);
    });


    this.pool.on('error', (error) => {
      console.error('pg error', error);
      // this.serviceState.signalReady(this.serviceName);
    });

    // this.pool.on('error', (err) => {
    //   logger.warn('pg error', err);
    //   // kill container
    //   // console.debug('[pool.on.error]', error.message);
    //   // this.serviceState.signalReady(this.serviceName);
    // });

    // this.pool.on('notice', msg => {
    //   console.warn('notice:', msg)
    //   this.serviceState.signalNotReady(this.serviceName);
    // });
  }

  // https://github.com/brianc/node-postgres/issues/2112#issuecomment-597390977
  // /**
  // *  Returns a RedisManagement instance
  // * @returns {RedisManagement}
  // */
  // getClientInstance() {
  //   return this.pool;
  // }

  async query(query) {
    try {
      const result = await this.client.query(query);
      return result;
    } catch (err) {
      logger.warn('query: error=', err);
      throw err;
    } finally {
      this.client.release();
    }
  }

  /**
 * Query wrapper to not use pg directly.
 *
 * @param {string} text
 * @param {any[]} params
 */
  // query(text, params) {
  //   return promiseRetry({ retries: 15, randomize: true }, (retry, attempt) => pool.query(text, params).catch((err) => {
  //     if (err.code === 'ECONNREFUSED') {
  //       console.log(`retrying query, attempt #${attempt}`);
  //       return retry(err);
  //     }
  //     return Promise.reject(err);
  //   }));
  // }

  // TODO: RETRY ?
  async checkTable() {
    let query = {
      text: 'SELECT * FROM information_schema.tables WHERE table_name=$1;',
      values: [tableName],
    };
    try {
      // const result = await this.pool.query(query);
      const result = await this.query(query);
      logger.debug('checkTable result', result);
      if (!result.rowCount) {
        logger.info(`Table ${tableName} not found.`);
        query = {
          text: 'CREATE TABLE user_config ( '
                      + 'tenant varchar(255) NOT NULL, '
                      + 'username varchar(255) NOT NULL,'
                      + 'configuration json NOT NULL, '
                      + 'last_update timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP, '
                      + 'CONSTRAINT unique_user PRIMARY KEY (tenant, username) '
                   + ');',
        };
        // const result2 = await this.pool.query(query);
        const result2 = await this.query(query);
        logger.debug('checkTable result2', result2);
      } else {
        logger.info(`Table ${tableName}  already exists.`);
      }
      logger.info(`Table ${tableName} is available to use.`);
    } catch (err) {
      logger.error('err', err);
      throw err;
    }
  }

  /**
  * Creates a 'healthCheck'
  */
  createHealthChecker() {
    const healthChecker = async (signalReady, signalNotReady) => {
      const isReady = await this.liveness();
      if (isReady) {
        logger.debug('health: healthy');
        signalReady();
      } else {
        logger.error('health: unhealthy');
        signalNotReady();
      }
    };
    this.serviceState.addHealthChecker('postgres', healthChecker, configPG['healthcheck.ms']);
  }

  /**
   *
   */
  async liveness() {
    try {
      const result = await this.pool.query('SELECT NOW();');
      if (!result) {
        logger.error('readiness: false, cause: no stats ');
        return false;
      }
      logger.debug('readiness: true');
      return true;
    } catch (e) {
      logger.error('readiness: false, cause:', e);
      return false;
    }
  }

  /**
   *  Registers a shutdown to the redis
   */
  registerShutdown() {
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close postgres...');
      await this.pool.end();
      logger.warn('ShutdownHandler: Closed postgres.');
    });
  }
}

module.exports = new Postgres();
