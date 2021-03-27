const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const Requests = require('./Requests.js');

const logger = new Logger('backstage:Keycloak');

const { keycloak: configKeycloak } = getConfig('BACKSTAGE');


/**
 * Wrapper for Keycloak
 */
class Keycloak {
  /**
   * @constructor
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register service 'Keycloak'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   */
  constructor(serviceState) {
    this.keycloakApi = new Requests(
      configKeycloak['url.api.gateway'],
      configKeycloak['max.timeout.ms'],
    );
    this.serviceState = serviceState;
  }

  /**
     *  Returns a Query instance
     * @returns {Query}
     */
  getApiInstance() {
    return this.keycloakApi;
  }


  /**
 * Create a 'healthCheck' for Keycloak
 */
  createHealthChecker() {
    const healthChecker = async (signalReady, signalNotReady) => {
      const { connected } = await this.keycloakApi.getStatus();
      if (connected) {
        logger.debug('createHealthChecker: Keycloak is healthy');
        signalReady();
      } else {
        logger.warn('createHealthChecker: Keycloak is not healthy');
        signalNotReady();
      }
    };
    this.serviceState.addHealthChecker('keycloak', healthChecker, configKeycloak['heathcheck.ms']);
  }
}

module.exports = Keycloak;
