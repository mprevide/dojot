const {
  ServiceStateManager,
  ConfigManager: { getConfig, transformObjectKeys },
  Logger,
} = require('@dojot/microservice-sdk');

const camelCase = require('lodash.camelcase');

const { lightship: configLightship } = getConfig('BACKSTAGE');

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
      this.serviceState = new ServiceStateManager({
        lightship: transformObjectKeys(configLightship, camelCase),
      });

      this.serviceState.registerService('server');
      this.serviceState.registerService('keycloak');
      this.serviceState.registerService('redis-pub');
      this.serviceState.registerService('redis-sub');
      this.serviceState.registerService('postgres');

      this.server = new Server(this.serviceState);
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

      await Postgres.init(this.serviceState);
      await Redis.init(this.serviceState);
      Keycloak.init(this.serviceState, mountPoint);

      await this.server.init(express(
        this.serviceState,
        mountPoint,
        {
          redis: Redis,
          keycloak: Keycloak,
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
