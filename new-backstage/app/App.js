const {
  ServiceStateManager,
  ConfigManager: { getConfig, transformObjectKeys },
  Logger,
} = require('@dojot/microservice-sdk');

const camelCase = require('lodash.camelcase');

const { lightship: configLightship } = getConfig('BACKSTAGE');

const serviceState = new ServiceStateManager({
  lightship: transformObjectKeys(configLightship, camelCase),
});

serviceState.registerService('server');
serviceState.registerService('keycloak');
serviceState.registerService('redis-pub');
serviceState.registerService('redis-sub');
serviceState.registerService('postgres');


const logger = new Logger('backstage:App');

const Server = require('./Server');
const Keycloak = require('./keycloak');
const Redis = require('./redis');
const express = require('./express');
const Postgres = require('./postgres');

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

      // this.redis = new Redis(serviceState);
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

      await Postgres.init(serviceState);
      await Redis.init(serviceState);
      Keycloak.init(serviceState, mountPoint);

      await this.server.init(express(
        serviceState,
        mountPoint,
      ));
    } catch (e) {
      logger.error('init:', e);
      throw e;
    }
    logger.info('init:...service initialized.');
  }
}

module.exports = App;
