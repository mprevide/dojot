const {
  ConfigManager: { getConfig },
  Logger,
} = require('@dojot/microservice-sdk');
const Requests = require('./Requests.js');
const { buildUrlLogin, buildUrlLogout } = require('./Utils.js');

const {
  keycloak: configKeycloak,
  app: configApp,
} = getConfig('BACKSTAGE');

const logger = new Logger('backstage:Keycloak');


/**
 * Wrapper for Keycloak
 */
class Keycloak {
  /**
   *
   * @param {an instance of @dojot/microservice-sdk.ServiceStateManager
   *          with register service 'Keycloak'} serviceState
   *          Manages the services' states, providing health check and shutdown utilities.
   *
   * @param {String} mountPoint
   */
  init(serviceState, mountPoint) {
    this.createHealthChecker(serviceState);
    this.mountPoint = mountPoint;
    this.clientId = configKeycloak['public.client.id'];
    this.baseUrl = configApp['base.url'];
    this.externalKeycloakUrl = configKeycloak['url.external'];
    this.internalKeycloakUrl = configKeycloak['url.api.gateway'];
    this.healthCheckMs = configKeycloak['healthcheck.ms'];
    this.keycloakApi = new Requests(
      this.clientId,
      this.internalKeycloakUrl,
      `${this.baseUrl + this.mountPoint}/auth/return`,
    );
  }

  /**
   * Returns a Requests instance
   * @returns {Requests}
   */
  getApiInstance() {
    return this.keycloakApi;
  }

  /**
   * Built external URL for browser login
   *
   * @param {string} realm
   * @param {string} state
   * @param {string} codeChallenge
   * @returns
   */
  buildUrlLogin(realm, state, codeChallenge) {
    return buildUrlLogin({
      baseUrl: this.externalKeycloakUrl,
      clientId: this.clientId,
      realm,
      state,
      codeChallenge,
      codeChallengeMethod: configKeycloak['code.challenge.method'], // TODO
      urlReturn: `${this.baseUrl + this.mountPoint}/auth/return`,
    });
  }

  /**
   * Built external URL for browser logout
   *
   * @param {string} realm
   * @returns
   */
  buildUrlLogout(realm) {
    return buildUrlLogout({
      baseUrl: this.externalKeycloakUrl,
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
      const connected = await this.keycloakApi.getStatus();
      if (connected) {
        logger.debug('createHealthChecker: Keycloak is healthy');
        signalReady();
      } else {
        logger.warn('createHealthChecker: Keycloak is not healthy');
        signalNotReady();
      }
    };
    serviceState.addHealthChecker('keycloak',
      healthChecker, this.healthCheckMs);
  }
}

const keycloakInstance = new Keycloak();
module.exports = keycloakInstance;
