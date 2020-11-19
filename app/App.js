const {
  ServiceStateManager,
  ConfigManager: { getConfig, transformObjectKeys },
  Logger,
} = require('@dojot/microservice-sdk');

const camelCase = require('lodash.camelcase');
const InfluxState = require('./influx/State');
const InfluxQueryData = require('./influx/QueryData');

const { influx: configInflux, lightship: configLightship } = getConfig('RETRIEVER');

const serviceState = new ServiceStateManager({
  lightship: transformObjectKeys(configLightship, camelCase),
});


const logger = new Logger('influxdb-retriever:App');

const devicesRoutes = require('./express/routes/v1/Devices');
const express = require('./express');

/**
* Wrapper to initialize the service
*/
class App {
  /**
    * Constructor App
    * that instantiate influxdb classes
    */
  constructor() {
    logger.debug('constructor: instantiate app...');
    try {
      this.influxQueryData = new InfluxQueryData(
        configInflux.url,
        configInflux['default.token'],
        configInflux['default.bucket'],
      );
      this.influxState = new InfluxState(
        configInflux.url,
      );
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
      serviceState.registerService('influxdb');
      this.createInfluxHealthChecker();

      const influxIsReady = await this.influxState.isReady();
      if (!influxIsReady) {
        throw new Error('Influxdb is not ready');
      }

      serviceState.signalReady('influxdb');

      const boundQueryData = this.influxQueryData.queryData.bind(this.influxQueryData);
      // init express with some route
      express(
        [
        // The order of the routes matters
          devicesRoutes({
            mountPoint: '/tss/v1',
            queryData: boundQueryData,
          }),
        ],
        serviceState,
      );
    } catch (e) {
      logger.error('init:', e);
      throw e;
    }
    logger.info('init:...service initialized.');
  }

  /**
    * Create a Health Checker  to check if it's possible
    * communication with influxdb
    */
  createInfluxHealthChecker() {
    const boundIsHealthInflux = this.influxState
      .isHealth.bind(this.influxState);

    const influxdbHealthChecker = async (signalReady, signalNotReady) => {
      const isHealth = await boundIsHealthInflux();
      if (isHealth) {
        logger.debug('influxdbHealthChecker: Server is healthy');
        signalReady();
      } else {
        logger.warn('influxdbHealthChecker: Server is not healthy');
        signalNotReady();
      }
    };
    serviceState.addHealthChecker('influxdb', influxdbHealthChecker, configInflux['heathcheck.ms']);
  }
}

module.exports = App;
