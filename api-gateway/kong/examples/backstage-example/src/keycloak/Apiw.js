const { default: axios } = require('axios');
const querystring = require('querystring');
const { handleErrorAxios } = require('../../../backstage-example-2/app/Utils');

const {
  pathKeycloakToken,
  pathKeycloakInfo,
} = require('../../../backstage-example-2/app/keycloak/Utils');
const config = require('../Config');

const axiosKeyCloack = axios.create({
  baseURL: config.KEYCLOAK_URL,
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
});


const getTokenByAuthorizationCode = async (realm, authorizationCode, codeVerifier) => {
  try {
  // console.log('getTokenByAuthorizationCode ');
  // console.log('authorizationCode ', authorizationCode);
  // console.log('codeVerifier ', codeVerifier);
    const result = await axiosKeyCloack.post(
      pathKeycloakToken(realm),
      querystring.stringify({
        grant_type: 'authorization_code',
        redirect_uri: config.REDIRECT_URL_BACK,
        client_id: 'gui',
        code_verifier: codeVerifier,
        code: authorizationCode,
      }),
      {
        maxRedirects: 0,
      },
    );

    if (result.status === 200) {
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
      } = result.data;

      return {
        accessToken,
        expiresIn,
        refreshExpiresIn,
        refreshToken,
      };
    }
  } catch (error) {
    handleErrorAxios(error);
  }
};

/**
 *
 * @param {*} realm
 * @param {*} accessToken
 * @returns
 */
const getPermissionsByToken = async (realm, accessToken) => {
  try {
    const axiosPromise = axiosKeyCloack.post(
      pathKeycloakToken(realm),
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

    const result = await axiosPromise;

    if (result.status === 200) {
      const permissionsArr = result.data.reduce((filtered, value) => {
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
  } catch (error) {
    handleErrorAxios(error);
  }
};


/**
 *
 * @param {*} realm
 * @param {*} accessToken
 * @returns
 */
const getUserInfoByToken = async (realm, accessToken) => {
  try {
    // console.log("realm, accessToken", realm, accessToken);
    const result = await axiosKeyCloack.get(
      pathKeycloakInfo(realm),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    );

    if (result.status === 200) {
      return {
        name: result.data.name ? result.data.name : '',
        username: result.data.preferred_username,
        email: result.data.email,
        email_verified: result.data.email_verified,
        realm,
      };
    }
  } catch (error) {
    handleCatchAxios(error);
  }
};

module.exports = {
  getTokenByAuthorizationCode,
  getPermissionsByToken,
  getUserInfoByToken,
};
