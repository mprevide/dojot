const {
  ServiceStateManager,
  ConfigManager: { getConfig, transformObjectKeys },
  Logger,
} = require('@dojot/microservice-sdk');
const path = require('path');

const camelCase = require('lodash.camelcase');

const { lightship: configLightship } = getConfig('BACKSTAGE');

const serviceState = new ServiceStateManager({
  lightship: transformObjectKeys(configLightship, camelCase),
});

serviceState.registerService('server');
serviceState.registerService('keycloak');
serviceState.registerService('redis-pub');
serviceState.registerService('redis-sub');

const logger = new Logger('backstage:App');

const Server = require('./Server');
const Keycloak = require('./keycloak');
const Redis = require('./redis');
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
      // TODO singleton??
      // this.keycloak = new Keycloak(serviceState);
      // TODO singleton??
      this.redis = new Redis(serviceState);
    } catch (e) {
      logger.error('constructor:', e);
      throw e;
    }
  }

  /**
   * Initialize the server and Backstage
   */
  async init() {
    logger.info('init: Initializing the backstage...');
    try {
      const mountPoint = '/backstage/v1';
      // TODO pass to keycloak '/backstage/v1',
      console.log('Keycloak', Keycloak);
      Keycloak.init(serviceState, mountPoint);

      await this.redis.init();
      await this.server.init(express(
        serviceState,
        openApiPath,
        mountPoint,
        {
          // keycloak: Keycloak,
          redis: this.redis.getManagementInstance(),
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
