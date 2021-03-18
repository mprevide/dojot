const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const Api = require('./Api.js');
const {
  buildUrlLogin,
  buildUrlLogout,
} = require('./BuildExternalUrls.js');

const logger = new Logger('influxdb-retriever:Influx');

const { keycloack: configKeycloack } = getConfig('RETRIEVER');


/**
 * Wrapper for InfluxDB
 */
class Keycloack {
  /**
     * @constructor
     *
     * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
     *          with register service 'influxdb'} serviceState
     *          Manages the services' states, providing health check and shutdown utilities.
     */
  constructor(serviceState) {
    this.keycloackApi = new Api(
      configKeycloack['url.api.gateway'],
      configKeycloack['max.timeout.ms'],
    );
    this.serviceState = serviceState;
  }

  /**
     *  Returns a Query instance
     * @returns {Query}
     */
  getApi() {
    return this.keycloackApi;
  }

  /**
   *  Returns a Query instance
   * @returns {Query}
   */
  static buildUrlLogout(realm) {
    return buildUrlLogout(realm);
  }


  /**
   *  Returns a Query instance
   * @returns {Query}
   */
  buildUrlLogin(clientId,
    state,
    realm,
    codeChallenge,
    codeChallengeMethod) {
    return buildUrlLogin(clientId,
      state,
      realm,
      codeChallenge,
      codeChallengeMethod);
  }


  /**
 * Create a 'healthCheck' for influxDB
 */
  createHealthChecker() {
    const healthChecker = async (signalReady, signalNotReady) => {
      const { connected } = await this.keycloackApi.getStatus();
      if (connected) {
        logger.debug('createHealthChecker: InfluxDB is healthy');
        signalReady();
      } else {
        logger.warn('createHealthChecker: InfluxDB is not healthy');
        signalNotReady();
      }
    };
    this.serviceState.addHealthChecker('keycloack', healthChecker, configKeycloack['heathcheck.ms']);
  }
}

module.exports = Keycloack;
