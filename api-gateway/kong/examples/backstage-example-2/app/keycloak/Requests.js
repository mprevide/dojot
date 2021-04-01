const { Logger } = require('@dojot/microservice-sdk');
const { default: axios } = require('axios');
const querystring = require('querystring');

const createError = require('http-errors');

/**
 * Transforms from the time window that will expire, to the exact moment that will expire
 *
 * @param {Number} expiresIn In seconds
 * @returns {Date}
 */
const expiresInToExpiresAt = (expiresIn) => new Date(Date.now() + expiresIn * 1000);

/**
 * Handle errors from keycloak and kong then standardize
 *
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
 * @param {string} realm
 * @returns
 */
function endpointOIDC(realm) {
  return `/realms/${realm}/protocol/openid-connect`;
}

/**
 *
 * @param {string} realm
 * @returns
 */
function endpointOIDCToken(realm) {
  return `${endpointOIDC(realm)}/token`;
}


/**
 * This class call Keycloak api
 */
class Requests {
  /**
   * @constructor
   *
   * @param {string} clientId
   * @param {string} keycloakInternalURL
   * @param {string} urlToReturn
   */
  constructor(
    clientId,
    keycloakInternalURL,
    urlToReturn,
  ) {
    this.logger = new Logger('backstage:keycloak/Requests');

    this.logger.debug('constructor:');
    this.logger.debug(`constructor: clientId=${clientId}`);
    this.logger.debug(`constructor: keycloakInternalURL=${keycloakInternalURL}`);
    this.logger.debug(`constructor: urlToReturn=${urlToReturn}`);

    this.urlToReturn = urlToReturn;

    this.axiosKeycloak = axios.create({
      baseURL: keycloakInternalURL,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    });
    this.clientId = clientId;
  }


  /**
   * Get a  token from the authorization code
   *
   * @throws Will throw an error if cannot get token using  authorization code
   *
   * @param {string} realm
   * @param {string} authorizationCode
   * @param {string} codeVerifier
   *
   * @returns {{accessToken: string,
   *            accessTokenExpiresAt: Date,
   *            refreshExpiresAt: Date,
   *            refreshToken: string,
   *            sessionState: string }} object with new access token, new refresh token,
   *                                    and when the tokens will expire
   */
  async getTokenByAuthorizationCode(realm, authorizationCode, codeVerifier) {
    this.logger.info('getTokenByAuthorizationCode: Getting Access Token by Authorization Code...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        endpointOIDCToken(realm),
        querystring.stringify({
          grant_type: 'authorization_code',
          // TODO the redirect_uri needs to be passed with a valid value, but it is not used
          redirect_uri: this.urlToReturn,
          client_id: this.clientId,
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
          expires_in: accessTokenExpiresIn,
          refresh_expires_in: refreshExpiresIn,
          refresh_token: refreshToken,
          // token_type: tokenType, //TODO
          // id_token: idToken,
          session_state: sessionState,
          // scope,
          // 'not-before-policy': notBeforePolicy,
        } = data;

        const refreshExpiresAt = expiresInToExpiresAt(refreshExpiresIn);
        const accessTokenExpiresAt = expiresInToExpiresAt(accessTokenExpiresIn);

        return {
          accessToken,
          accessTokenExpiresAt,
          refreshExpiresAt,
          refreshToken,
          sessionState,
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
   * Get a new token from the refresh token
   *
   * @throws Will throw an error if cannot get token using refresh token
   *
   * @param {string} realm
   * @param {string} refreshToken
   *
   * @returns {{accessToken: string,
   *            accessTokenExpiresAt: Date,
   *            refreshExpiresAt: Date,
   *            refreshToken: string,
   *            sessionState: string }} object with new access token, new refresh token,
   *                                    and when the tokens will expire
   */
  async getTokenByRefreshToken(realm, refreshToken) {
    this.logger.info('getTokenByRefreshToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        endpointOIDCToken(realm),
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
          // token_type: tokenType,// TODO
          // id_token: idToken,
          session_state: sessionState,
          // scope,
          // 'not-before-policy': notBeforePolicy,
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
   * Obtains user permission information by token
   *
   * @throws Will throw an error if cannot get user permission information
   *
   * @param {string} realm
   * @param {string} accessToken
   *
   * @returns {{resourceName: string, scopes: string[]}[]}
   *                           Array the objects with user permission information
   */
  async getPermissionsByToken(realm, accessToken) {
    this.logger.debug('getPermissionsByToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.post(
        endpointOIDCToken(realm),
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
   * Obtains user information by token
   *
   * @throws Will throw an error if cannot get user info
   *
   * @param {string} realm
   * @param {string} accessToken
   *
   * @returns {{name: string, username: string,
   *           email: string, emailVerified: boolean,
   *           realm: string, tenant: string}} Object with user information
   */
  async getUserInfoByToken(realm, accessToken) {
    this.logger.debug('getUserInfoByToken: Getting the CRL...');
    try {
      const {
        status,
        statusText,
        data,
      } = await this.axiosKeycloak.get(
        `${endpointOIDC(realm)}/userinfo`,
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

      throw new Error(`getUserInfoByToken: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getUserInfoByToken:', newError);
      throw newError;
    }
  }


  /**
   * Getting Keycloak status
   *
   * @returns {boolean} if the service is available
   */
  async getStatus() {
    this.logger.debug('getStatus: Getting Keycloak status...');
    try {
      const {
        status,
        statusText,
      } = await this.axiosKeycloak.get('/');

      if (status === 200) {
        return true;
      }

      throw new Error(`getStatus: The API returns: code=${status}; message=${statusText}`);
    } catch (error) {
      const newError = commonHandleError(error);
      this.logger.error('getStatus:', newError);
      return false;
    }
  }
}

module.exports = Requests;
