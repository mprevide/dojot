const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const Requests = require('./Requests.js');
const { buildUrlLogin, buildUrlLogout } = require('./Utils.js');

const {
  keycloak: configKeycloak,
} = getConfig('BACKSTAGE');

const logger = new Logger('backstage:Keycloak');

/**
 * Wrapper for Keycloak
 */
class Keycloak {
  /**
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register service 'keycloak'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   *
   * @param {String} mountPoint
   */
  init(serviceState) {
    this.serviceName = 'keycloak';
    this.clientId = configKeycloak['public.client.id'];
    this.externalKeycloakUrl = configKeycloak['url.external'];
    this.internalKeycloakUrl = configKeycloak['url.api.gateway'];
    this.healthCheckMs = configKeycloak['healthcheck.ms'];
    this.createHealthChecker(serviceState);
    this.requests = new Requests(
      this.clientId,
      this.internalKeycloakUrl,
    );
    this.initialized = true;
  }

  /**
   * Returns a Requests instance
   * @returns {Requests}
   */
  getRequestsInstance() {
    this.checkInitiated();
    return this.requests;
  }

  /**
   * Checks whether it was started properly by calling the init method
   * @private
   */
  checkInitiated() {
    if (!this.initialized) {
      throw new Error('Call init method first');
    }
  }

  /**
   * Built external URL for browser login
   *
   * @param {string} realm
   * @param {string} state
   * @param {string} codeChallenge
   * @returns
   */
  buildUrlLogin(realm, state, codeChallenge, urlReturn) {
    this.checkInitiated();
    return buildUrlLogin({
      baseUrl: this.externalKeycloakUrl,
      clientId: this.clientId,
      realm,
      state,
      codeChallenge,
      codeChallengeMethod: configKeycloak['code.challenge.method'],
      urlReturn,
    });
  }

  /**
   * Built external URL for browser logout
   *
   * @param {string} realm
   * @returns
   */
  buildUrlLogout(realm, redirectUri) {
    this.checkInitiated();
    return buildUrlLogout({
      baseUrl: this.externalKeycloakUrl,
      redirectUri,
      realm,
    });
  }

  /**
   * Create a 'healthCheck' for Keycloak
   *
   * @private
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register service 'Keycloak'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   */
  createHealthChecker(serviceState) {
    const healthChecker = async (signalReady, signalNotReady) => {
      const connected = await this.requests.getStatus();
      if (connected) {
        logger.debug('createHealthChecker: Keycloak is healthy');
        signalReady();
      } else {
        logger.warn('createHealthChecker: Keycloak is not healthy');
        signalNotReady();
      }
    };
    serviceState.addHealthChecker(this.serviceName,
      healthChecker, this.healthCheckMs);
  }
}

module.exports = new Keycloak();
