const { Logger, ConfigManager } = require('@dojot/microservice-sdk');
const { default: axios } = require('axios');
const querystring = require('querystring');

const createError = require('http-errors');

const { keycloak: configKeycloak } = ConfigManager.getConfig('BACKSTAGE');

/**
 *
 * @param {*} expiresIn In seconds
 * @returns
 */
const expiresInToExpiresAt = (expiresIn) => new Date(Date.now() + expiresIn * 1000);

/**
 * Handles error coming from the TODO
 * @param {Error} error
 * @returns  {Error}
 */
const commonHandleError = (error) => {
  if (error.response && error.response.status && error.response.data) {
    const {
      status,
      data: {
        error: errorTxt,
        error_description: errorDesc,
        message: messageError,
      },
    } = error.response;
    if (errorTxt && !errorDesc) {
      return createError(status, errorTxt);
    } if (errorTxt && errorDesc) {
      return createError(status, `${errorTxt}: ${errorDesc}`);
    } if (messageError) {
      return createError(status, messageError);
    }
  }
  return (error);
};

/**
 *
 * @param {*} realm
 * @returns
 */
function pathEndPoint(realm) {
  return `/realms/${realm}/protocol/openid-connect`;
}

/**
 *
 * @param {*} realm
 * @returns
 */
function pathTokenEndPoint(realm) {
  return `${pathEndPoint(realm)}/token`;
}


/**
 * This class call Keycloak api
 */
class Requests {
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
  constructor(internalUrl = 'http://localhost:8000',
    baseUrl='http://localhost:8000',
    clientId = 'gui',
    mountPoint = '/backstage/v1',
    timeout = 30000) {
    this.baseURL = baseUrl;
    this.axiosKeycloak = axios.create({
      timeout,
      baseURL: internalUrl,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    this.clientId = clientId;
    this.mountPoint = mountPoint;
    this.logger = new Logger('backstage:keycloak/Requests');
  }

  getURIInternalReturn() {
    return `${this.baseURL + this.mountPoint}/auth/return`;
  }

  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier) {
    this.logger.info('getTokenByAuthorizationCode: Getting Access Token by Authorization Code...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        pathTokenEndPoint(realm),
        querystring.stringify({
          grant_type: 'authorization_code',
          redirect_uri: this.getURIInternalReturn(),
          client_id: this.clientId,
          code_verifier: codeVerifier,
          code: authorizationCode,
        }),
        // ,
        // {
        //   maxRedirects: 0,
        //   headers: { 'content-type': 'application/x-www-form-urlencoded' },
        // },
      );

      if (status === 200) {
        const {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          refresh_expires_in: refreshExpiresIn,
          refresh_token: refreshToken,
          token_type: tokenType,
          id_token: idToken,
          session_state: sessionState,
          scope,
          'not-before-policy': notBeforePolicy,
        } = data;

        const refreshExpiresAt = expiresInToExpiresAt(refreshExpiresIn);
        const accessTokenExpiresAt = expiresInToExpiresAt(accessTokenExpiresIn);

        return {
          accessToken,
          accessTokenExpiresAt,
          sessionState,
          refreshExpiresAt,
          refreshToken,
        };
      }

      throw new Error(`getTokenByAuthorizationCode: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getTokenByAuthorizationCode:', newError);
      throw newError;
    }
  }


  /**
   * Gets the latest CRL released by the root CA.
   *
   * @throws Will throw an error if cannot retrieve CRL
   *
   * @returns {String|null} PEM encoded CRL
   */
  async getTokenByRefreshToken(realm, refreshToken) {
    this.logger.info('getTokenByRefreshToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        pathTokenEndPoint(realm),
        querystring.stringify({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          refresh_token: refreshToken,
        }),
      );

      if (status === 200) {
        const {
          access_token: accessToken,
          expires_in: accessTokenExpiresIn,
          refresh_expires_in: refreshExpiresIn,
          refresh_token: refreshTokenNew,
          token_type: tokenType,
          id_token: idToken,
          session_state: sessionState,
          scope,
          'not-before-policy': notBeforePolicy,
        } = data;

        const refreshExpiresAt = expiresInToExpiresAt(refreshExpiresIn);
        const accessTokenExpiresAt = expiresInToExpiresAt(accessTokenExpiresIn);

        return {
          accessToken,
          accessTokenExpiresAt,
          refreshExpiresAt,
          refreshToken: refreshTokenNew,
          sessionState,
        };
      }
      throw new Error(`getTokenByRefreshToken: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getTokenByRefreshToken:', newError);
      throw newError;
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
    // console.log('realm=', realm);
    // console.log('accessToken=', accessToken);
    this.logger.debug('getPermissionsByToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        pathTokenEndPoint(realm),
        querystring.stringify({
          grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
          audience: 'kong',
          response_mode: 'permissions',
        }),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'content-type': 'application/x-www-form-urlencoded',
          },
        },
      );

      // If the authorization request does not map to any permission, a 403 HTTP status code is returned instead.
      // 401 {"error":"HTTP 401 Unauthorized"}
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

      throw new Error(`getPermissionsByToken: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getPermissionsByToken:', newError);
      throw newError;
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
        `${pathEndPoint(realm)}/userinfo`,
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

      // 401 Unauthorized
      // 403 Forbidden
      // 500 Internal Server Error

      throw new Error(`getUserInfoByToken: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getUserInfoByToken:', newError);
      throw newError;
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
        // data,
      } = await this.axiosKeycloak.get(
        '/',
      );

      if (status === 200) {
        return {
          connected: true,
        };
      }

      throw new Error(`getStatus: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getStatus:', newError);
      return {
        connected: false,
      };
    }
  }
}

module.exports = Requests;
