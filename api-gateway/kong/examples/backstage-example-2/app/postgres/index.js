const { Client } = require('pg');
const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');

const logger = new Logger('backstage:Postgres');

const { postgres_client: configClientPG, postgres: configPG } = getConfig('BACKSTAGE');

const tableName = 'user_config';

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
    this.serviceState = serviceState;
    this.client = new Client(configClientPG);
    await this.client.connect();
    await this.checkTable();
    this.createHealthChecker();
    this.registerShutdown();
  }


  /**
  *  Returns a RedisManagement instance
  * @returns {RedisManagement}
  */
  getClientInstance() {
    return this.client;
  }


  async checkTable() {
    let query = {
      text: 'SELECT * FROM information_schema.tables WHERE table_name=$1;',
      values: [tableName],
    };
    try {
      const result = await this.client.query(query);
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
        const result2 = await this.client.query(query);
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
      // Try and make a query
      try {
        const result = await this.client.query('SELECT NOW();');
        if (!result) {
          logger.error('health: unhealthy, cause: no stats ');
          signalNotReady();
        }

        logger.debug('health: healthy');
        signalReady();
      } catch (e) {
        logger.error('health: unhealthy, cause: no stats ', e);
        signalNotReady();
      }
    };
    this.serviceState.addHealthChecker('postgres', healthChecker, configPG['healthcheck.ms']);
  }

  /**
   *  Registers a shutdown to the redis
   */
  registerShutdown() {
    this.serviceState.registerShutdownHandler(async () => {
      logger.debug('ShutdownHandler: Trying close postgres...');
      await this.client.end();
      logger.warn('ShutdownHandler: Closed postgres.');
    });
  }
}

module.exports = new Postgres();
