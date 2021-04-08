const { Logger, ConfigManager: { getConfig } } = require('@dojot/microservice-sdk');
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
   *  Create session, generate PKCE, and redirect to the
   *  keycloack login screen using the openid connect protocol
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

  /**
   * Called when there is success in the login screen, this endpoint
   * is passed as `redirect_uri` when redirecting to the keycloack login screen
   * and if the login happens
   * correctly the keycloack calls this endpoint.
   * The openid connect protocol is used.
   */
  const authReturn = {
    mountPoint,
    name: 'auth-return-route',
    path: ['/auth/return'],
    handlers: [
      {
        method: 'get',
        middleware: [
          async (req, res) => {
            logger.debug('auth-return-route.get: req.query=', req.query);
            logger.debug('auth-return-route.get: req.sessionID=', req.sessionID);

            try {
              const url = new URL(GUI_RETURN_URL);

              const {
                realm,
                codeVerifier,
              } = req.session;

              if (codeVerifier) {
                const {
                  state,
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

                  url.searchParams.append('state', state);

                  logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with state=${state}`);
                  return res.redirect(303, url.href);
                } catch (e) {
                  req.session.destroy((err, msg) => {
                    logger.warn('auth-return-route.get:session-destroy-error:', msg, err);
                  });

                  url.searchParams.append('error', e);

                  logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with e=${e}`);
                  return res.redirect(303, url.href);
                }
              } else {
                const e = 'There is no active session';
                url.searchParams.append('error', e);
                logger.debug(`auth-return-route.get: redirect to ${GUI_RETURN_URL} with e=${e}`);
                return res.redirect(303, url.href);
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
          async (req, res) => {
            res.set('Cache-Control', 'no-store');
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
                return res.status(200).json(result);
              }
            } catch (e) {
              logger.error('device-user-info.get:', e);
            }
            return res.status(401)
              .json({ error: 'There is no active session' });
          },
        ],
      },
    ],
  };

  /**
   * Logout the active user using openid connect and redirects to
   * the keycloack logout url if there is an active session and
   * that keycloack url redirects to `gui.home.url` or redirects directly
   * to` gui.home.url` with an error query string.
   */
  const authLogout = {
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
              const url = new URL(GUI_HOME_URL);
              const e = 'There is no active session';

              url.searchParams.append('error', e);
              logger.debug(`auth-user-logout-route.get: redirect to ${GUI_HOME_URL} with error=${e}`);
              return res.redirect(303, url.href);
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
    authLogout];
};
