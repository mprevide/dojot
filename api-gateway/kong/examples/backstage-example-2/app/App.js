const {
  ServiceStateManager,
  ConfigManager: { getConfig, transformObjectKeys },
  Logger,
} = require('@dojot/microservice-sdk');
const path = require('path');

const camelCase = require('lodash.camelcase');

const { lightship: configLightship } = getConfig('RETRIEVER');

const serviceState = new ServiceStateManager({
  lightship: transformObjectKeys(configLightship, camelCase),
});
serviceState.registerService('server');
serviceState.registerService('keycloack');

const logger = new Logger('influxdb-retriever:App');

const Server = require('./Server');
const Keycloack = require('./keycloack');
const express = require('./express');

const openApiPath = path.join(__dirname, '../api/v1.yml');


/**
  * Wrapper to initialize the service
  */
class App {
/**
 *
 */
  constructor() {
    logger.debug('constructor: instantiate app...');
    try {
      this.server = new Server(serviceState);
      this.keycloack = new Keycloack(serviceState);
    } catch (e) {
      logger.error('constructor:', e);
      throw e;
    }
  }

  /**
     * Initialize the server and influxdb
     */
  async init() {
    logger.info('init: Initializing the influxdb-retriever...');
    try {
      this.keycloack.createHealthChecker();
      this.server.registerShutdown();

      this.server.init(express(
        serviceState,
        openApiPath,
        {
          keycloack: this.keycloack,
        },
      ));
    } catch (e) {
      logger.error('init:', e);
      throw e;
    }
    logger.info('init:...service initialized.');
  }
}

module.exports = App;
