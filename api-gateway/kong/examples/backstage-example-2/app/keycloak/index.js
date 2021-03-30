const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const Requests = require('./Requests.js');
const { buildUrlLogin, buildUrlLogout } = require('./Utils.js');

const logger = new Logger('backstage:Keycloak');

const { keycloak: configKeycloak, app: configApp } = getConfig('BACKSTAGE');


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
  constructor(serviceState, mountPoint = '/backstage/v1') {
    this.mountPoint = mountPoint;
    this.keycloakApi = new Requests(
      configKeycloak['public.client.id'],
      configKeycloak['url.api.gateway'],
      `${configApp['base.url'] + mountPoint}/auth/return`,
    );
    this.serviceState = serviceState;
  }

  init() {
    this.createHealthChecker();
  }

  /**
     *  Returns a Query instance
     * @returns {Query}
     */
  getApiInstance() {
    return this.keycloakApi;
  }

  static buildUrlLogin(realm, state, codeChallenge) {
    buildUrlLogin({
      baseUrl: configApp['base.url'],
      clientId: configKeycloak['public.client.id'],
      realm,
      state,
      codeChallenge,
      codeChallengeMethod: 'S256', // TODO
      urlReturn: `${configApp['base.url'] + this.mountPoint}/auth/return`,
    });
  }

  static buildUrlLogout(realm) {
    buildUrlLogout({
      baseUrl: configApp['base.url'],
      realm,
    });
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
