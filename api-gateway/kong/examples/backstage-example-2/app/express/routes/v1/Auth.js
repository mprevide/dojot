const { Logger, ConfigManager: { getConfig } } = require('@dojot/microservice-sdk');
const HttpStatus = require('http-status-codes');
const { generatePKCEChallenge } = require('../../../Utils');
const Keycloak = require('../../../keycloak');

const {
  gui: configGui,
} = getConfig('BACKSTAGE');

const GUI_RETURN_URL = configGui['return.url'];
const GUI_HOME_URL = configGui['home.url'];

const logger = new Logger('backstage:express/routes/v1/Auth');

/**
 * Routes to Auth
 *
 * @param {string} mountPoint be used as a route prefix
*/
module.exports = ({ mountPoint }) => {
  /**
   * TODO
   */
  const auth = {
    mountPoint,
    name: 'auth-route',
    path: ['/auth'],
    handlers: [
      {
        method: 'get',
        middleware: [
          async (req, res) => {
            logger.debug('auth-route.get: req.params=', req.params);
            logger.debug('auth-route.get: req.query=', req.query);
            logger.debug('auth-route.get: req.sessionID=', req.sessionID);

            try {
              const { tenant: realm, state } = req.query;
              const newState = state ? 'login-state' : state;

              const { codeVerifier, codeChallenge } = generatePKCEChallenge();

              const url = Keycloak.buildUrlLogin(
                realm,
                newState,
                codeChallenge,
              );

              req.session.codeChallenge = codeChallenge;
              req.session.codeVerifier = codeVerifier;
              req.session.realm = realm;
              req.session.tenant = realm;
              logger.debug(`auth-route.get: redirect to ${url}`);
              return res.redirect(303, url);
            } catch (e) {
              logger.error('auth-route.get:', e);
              throw e;
            }
          },
        ],
      },
    ],
  };

  const authReturn = {
    mountPoint,
    name: 'auth-return-route',
    path: ['/auth/return'],
    handlers: [
      {
        method: 'get',
        middleware: [
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-return-route.get: req.params=', req.params);
            logger.debug('auth-return-route.get: req.query=', req.query);
            logger.debug('auth-return-route.get: req.sessionID=', req.sessionID);

            // ?error=invalid_request&
            // error_description=Invalid+parameter%3A+code_challenge_method&
            // state=undefined

            try {
              const {
                realm,
                codeVerifier,
              } = req.session;

              if (codeVerifier) {
                const {
                  state,
                  session_state: sessionState,
                  code: authorizationCode,
                } = req.query;
                try {
                  const {
                    accessToken,
                    refreshToken,
                    refreshExpiresAt,
                    accessTokenExpiresAt,
                  } = await Keycloak.getRequestsInstance().getTokenByAuthorizationCode(
                    realm,
                    authorizationCode,
                    codeVerifier,
                  );

                  req.session.accessToken = accessToken;
                  req.session.refreshToken = refreshToken;
                  req.session.refreshExpiresAt = refreshExpiresAt;
                  req.session.accessTokenExpiresAt = accessTokenExpiresAt;

                  // TODO
                  // encode URL
                  logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with state=${state} and session_state=${sessionState}`);
                  return res.redirect(303, `${GUI_RETURN_URL}?state=${state}&session_state=${sessionState}`);
                } catch (e) {
                  req.session.destroy((err, msg) => {
                    logger.warn('auth-return-route.get:session-destroy-error:', msg, err);
                  });
                  // condition for some specific else throw e
                  // TODO
                  // encode URL
                  logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with e=${e}`);
                  return res.redirect(303, `${GUI_RETURN_URL}?error=${e}`);
                }
              }
            } catch (e) {
              logger.error('auth-return-route.get:', e);
              throw e;
            }
            const e = 'There is no active session';
            logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with e=${e}`);
            // TODO
            // encode URL
            return res.redirect(303, `${GUI_RETURN_URL}?error=${e}`);
          },
        ],
      },
    ],
  };

  const authUserInfo = {
    mountPoint,
    name: 'auth-user-info-route',
    path: ['/auth/userInfo'],
    handlers: [
      {
        method: 'get',
        middleware: [
          async (req, res) => {
            logger.debug('auth-user-info-route.get: req.sessionID=', req.sessionID);

            try {
              if (req.session && req.session.realm && req.session.accessToken) {
                const { realm, accessToken } = req.session;

                const permissionsArr = await Keycloak.getRequestsInstance()
                  .getPermissionsByToken(realm, accessToken);
                const userInfoObj = await Keycloak.getRequestsInstance()
                  .getUserInfoByToken(realm, accessToken);
                const result = {
                  permissions: permissionsArr,
                  ...userInfoObj,
                };
                logger.debug(`auth-user-info-route.get: result=${JSON.stringify(result)}`);
                return res.status(HttpStatus.OK).json(result);
              }
            } catch (e) {
              logger.error('device-user-info.get:', e);
            }
            return res.status(HttpStatus.UNAUTHORIZED)
              .json({ error: 'There is no active session' });
          },
        ],
      },
    ],
  };

  const authUserLogout = {
    mountPoint,
    name: 'auth-user-logout-route',
    path: ['/auth/logout'],
    handlers: [
      {
        method: 'get',
        middleware: [
          async (req, res) => {
            logger.debug(`auth-user-logout-route.get: req.sessionID=${JSON.stringify(req.sessionID)}`);

            try {
              if (req.session && req.session.realm) {
                const { realm } = req.session;
                req.session.destroy((err) => {
                  logger.warn(`auth-user-logout-route.get: session-destroy-error:=${JSON.stringify(err)}`);
                });
                const url = Keycloak.buildUrlLogout(realm, GUI_HOME_URL);

                logger.debug(`auth-user-logout-route.get: redirect to ${url}`);
                return res.redirect(303, url);
              }
              // TODO encode URL
              const e = 'There is no active session';
              logger.debug(`auth-user-logout-route.get: redirect to ${GUI_HOME_URL} with error=${e}`);
              return res.redirect(303, `${GUI_HOME_URL}?error=${e}`);
            } catch (e) {
              logger.error('auth-user-logout-route.get:', e);
              throw e;
            }
          },
        ],
      },
    ],
  };


  return [auth,
    authReturn,
    authUserInfo,
    authUserLogout];
};
