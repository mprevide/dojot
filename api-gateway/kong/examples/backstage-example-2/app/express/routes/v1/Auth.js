const { Logger } = require('@dojot/microservice-sdk');
const HttpStatus = require('http-status-codes');
const { generatePKCEChallenge } = require('../../../Utils');
const {
  buildUrlLogin,
  buildUrlLogout,
} = require('../../../keycloak/Utils.js');

const baseUrl = 'http://localhost:8000';

const logger = new Logger('backstage:express/routes/v1/Auth');

/**
 * Routes to Auth
 *
 * @param {string} mountPoint be used as a route prefix
 * @param {an instance of ../../../keycloak/index} keycloak
 *          Manages the TODO
*/
module.exports = ({ mountPoint, keycloak }) => {
/**
 * if there is no dateTo, add dateTo to
 * the pagination makes sense even
 * if new values are to be inserted
 */
  // const checkDateTo = (req, res, next) => {
  //   if (!req.query.dateTo) {
  //     req.query.dateTo = new Date().toISOString();
  //   }
  //   return next();
  // };

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
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-route.get: req.params=', req.params);
            logger.debug('auth-route.get: req.query=', req.query);
            logger.debug('auth-route.get: req.sessionID=', req.sessionID);

            try {
              const { tenant: realm, state } = req.query;
              const newState = state ? 'login-state' : state;

              const { codeVerifier, codeChallenge } = generatePKCEChallenge();
              const url = buildUrlLogin(
                realm,
                newState,
                codeChallenge,
              );

              req.session.codeChallenge = codeChallenge;
              req.session.codeVerifier = codeVerifier;
              req.session.realm = realm;
              req.session.tenant = realm;

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
                  } = await keycloak.getTokenByAuthorizationCode(
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
                  return res.redirect(303, `${baseUrl}/return?state=${state}`);
                } catch (e) {
                  req.session.destroy((err) => {
                    logger.error('auth-return-route.get:session-destroy-error:', err);
                  });
                  // condition for some specific else throw e
                  // TODO
                  // encode URL
                  return res.redirect(303, `${baseUrl}/return?error=${e}`);
                }
              }
            } catch (e) {
              logger.error('auth-return-route.get:', e);
              throw e;
            }
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
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-user-info-route.get: req.params=', req.params);
            logger.debug('auth-user-info-route.get: req.query=', req.query);
            logger.debug('auth-user-info-route.get: req.sessionID=', req.sessionID);

            try {
              if (req.session && req.session.realm && req.session.accessToken) {
                const { realm, accessToken } = req.session;

                const permissionsArr = await keycloak.getPermissionsByToken(realm, accessToken);
                const userInfoObj = await keycloak.getUserInfoByToken(realm, accessToken);
                const result = {
                  permissions: permissionsArr,
                  ...userInfoObj,
                };
                logger.debug(`auth-user-info-route.get: result=${JSON.stringify(result)}`);
                return res.status(HttpStatus.OK).json(result);
              }
            } catch (e) {
              // TODO condition for some specific else throw e
              logger.error('device-user-info.get:', e);
              return res.status(HttpStatus.UNAUTHORIZED)
                .json({ error: 'There is no active session' });
            }
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
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-user-logout-route.get: req.params=', req.params);
            logger.debug('auth-user-logout-route.get: req.query=', req.query);
            logger.debug('auth-user-logout-route.get: req.sessionID=', req.sessionID);

            try {
              if (req.session && req.session.realm) {
                const { realm } = req.session;
                req.session.destroy((err) => {
                  logger.error(`auth-user-logout-route.get:session-destroy-error:=${JSON.stringify(err)}`);
                });
                return res.redirect(303, buildUrlLogout(realm));
              }
              // TODO encode URL
              return res.redirect(303, `${baseUrl}?error=` + 'HouveUmProblema');
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
