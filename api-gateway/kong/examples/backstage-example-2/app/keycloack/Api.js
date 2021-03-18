const { Logger, ConfigManager } = require('@dojot/microservice-sdk');
const { default: axios } = require('axios');
const querystring = require('querystring');
// const axiosRetry = require('axios-retry');

// const {
//   app: configApp,
// } = ConfigManager.getConfig('CERT_SC');

/**
 * This class call X509IdentityMgmt api to sign a csr,
 * retrieve ca certificate and crl
 */
class Api {
  /**
   *
   * @param {*} url
   * @param {*} timeout
   * @param {*} retries
   * @param {*} paths
   * @param {*} paths.sign
   * @param {*} paths.crl
   * @param {*} paths.ca
   */
  constructor(url, timeout = 30000) {
    this.axiosKeycloak = axios.create({
      timeout,
      baseURL: url,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });

    this.logger = new Logger('cert-sc:x509IdentityMgmt/Client');
  }

  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier) {
    this.logger.debug('getTokenByAuthorizationCode: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        `/realms/${realm}/protocol/openid-connect/token`,
        querystring.stringify({
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:8000', // TODO  config.REDIRECT_URL_BACK, //
          client_id: 'gui',
          code_verifier: codeVerifier,
          code: authorizationCode,
        }),
        {
          maxRedirects: 0,
        },
      );

      if (status === 200) {
        const {
          access_token: accessToken,
          expires_in: expiresIn,
          refresh_expires_in: refreshExpiresIn,
          refresh_token: refreshToken,
          token_type: tokenType,
          id_token: idToken,
          session_state: sessionState,
          scope,
          'not-before-policy': notBeforePolicy,
        } = data;

        return {
          accessToken,
          expiresIn,
          refreshExpiresIn,
          refreshToken,
        };
      }

      this.logger.warn('getTokenByAuthorizationCode: Cannot retrieve CRL.  '
      + `The API returns: code=${status}; message=${statusText}`);
      return null;
    } catch (error) {
      this.logger.error('getTokenByAuthorizationCode:', error);
      throw new Error('Cannot retrieve CRL');
    }
  }

  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getPermissionsByToken(realm, accessToken) {
    this.logger.debug('getPermissionsByToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        `/realms/${realm}/protocol/openid-connect/token`,
        querystring.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
          audience: 'kong',
          response_mode: 'permissions',
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      if (status === 200) {
        const permissionsArr = data.reduce((filtered, value) => {
          const { rsname, scopes } = value;
          if (rsname !== 'Default Resource') {
            filtered.push({
              resourceName: rsname,
              scopes,
            });
          }
          return filtered;
        }, []);
        return permissionsArr;
      }

      this.logger.warn('getPermissionsByToken: Cannot retrieve CRL.  '
        + `The API returns: code=${status}; message=${statusText}`);
      return null;
    } catch (error) {
      this.logger.error('getPermissionsByToken:', error);
      throw new Error('Cannot retrieve CRL');
    }
  }

  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getUserInfoByToken(realm, accessToken) {
    this.logger.debug('getUserInfoByToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.get(
        `/realms/${realm}/protocol/openid-connect/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      if (status === 200) {
        return {
          name: data.name ? data.name : '',
          username: data.preferred_username,
          email: data.email,
          emailVerified: data.email_verified,
          realm,
          tenant: realm,
        };
      }

      this.logger.warn('getUserInfoByToken: Cannot retrieve CRL.  '
      + `The API returns: code=${status}; message=${statusText}`);
      return null;
    } catch (error) {
      this.logger.error('getUserInfoByToken:', error);
      throw new Error('Cannot retrieve CRL');
    }
  }


  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getStatus() {
    this.logger.debug('getStatus: ...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.get(
        '/',
      );

      if (status === 200) {
        return {
          connected: true,
        };
      }

      this.logger.warn('getStatus: Cannot .... .  '
        + `The API returns: code=${status}; message=${statusText}`);
      return {
        connected: false,
      };
    } catch (error) {
      this.logger.error('getStatus:', error);
      throw new Error('Cannot retrieve CRL');
    }
  }
}

module.exports = Api;
