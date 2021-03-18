const { Logger } = require('@dojot/microservice-sdk');
const HttpStatus = require('http-status-codes');
const { generatePKCEChallenge } = require('../../../Utils');

const logger = new Logger('influxdb-retriever:express/routes/v1/Device');

/**
 * Routes to Devices
 *
 * @param {string} mountPoint be used as a route prefix
 * @param {Promise<{result: object, totalItems: number}| error>>} queryDataByField
 *                               A promise that returns a result and a totalItems inside that result
 * @param {Promise<{result: object, totalItems: number}| error>>} queryDataByMeasurement
 *                               A promise that returns a result and a totalItems inside that result
 */
module.exports = ({ mountPoint, keycloack }) => {
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
   * This feature returns data for an device with time
   * filter, pagination and order
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

            try {
              // const { tenant, state } = req.query;
              // res.status(HttpStatus.OK).json({ data: 'x' });

              const { tenant, state } = req.query;
              const newState = state ? 'login-state' : state;

              // if (realm) {
              const { codeVerifier, codeChallenge } = generatePKCEChallenge();
              // const url = urlLoginKeycloack(
              //   'gui', // TODO
              //   newState,
              //   realm,
              //   codeChallenge,
              //   's256', // TODO
              // );

              const url = keycloack.buildUrlLogin(
                'gui', // TODO
                newState,
                tenant,
                codeChallenge,
                's256', // TODO
              );
              req.session.codeChallenge = codeChallenge;
              req.session.codeVerifier = codeVerifier;
              req.session.realm = tenant;
              req.session.tenant = tenant;

              console.log('/pkce will return');
              return res.redirect(303, url);
              // }

              // return res.status(401).send({ error: 'Missing attribute realm in query.' });
            } catch (e) {
              logger.error('device-route.get:', e);
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
            logger.debug('auth-return-route: req.params=', req.params);
            logger.debug('auth-return-route: req.query=', req.query);

            // ?error=invalid_request&
            // error_description=Invalid+parameter%3A+code_challenge_method&
            // state=undefined

            try {
              const hour = 20 * 1000; // 3600000
              const time = new Date(Date.now() + hour);
              console.log('time', time);
              req.session.cookie.expires = time;
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

                const {
                  accessToken,
                  expiresIn,
                  refreshExpiresIn,
                  refreshToken,
                } = await keycloack.getApi().getTokenByAuthorizationCode(
                  realm,
                  authorizationCode,
                  codeVerifier,
                );

                req.session.accessToken = accessToken;
                req.session.expiresIn = expiresIn;
                req.session.refreshExpiresIn = refreshExpiresIn;
                req.session.refreshToken = refreshToken;

                console.log(req.session);

                // return res.redirect(303,config.REDIRECT_URL_FRONT);

                res.status(HttpStatus.OK).json({ data: 'x' });
              }
            } catch (e) {
              logger.error('device-route.get:', e);
              throw e;
            }
          },
        ],
      },
    ],
  };

  const authUserInfo = {
    mountPoint,
    name: 'auth-userinfo-route',
    path: ['/auth/userinfo'],
    handlers: [
      {
        method: 'get',
        middleware: [
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-userinfo-route');
            try {
              // const permissionsArr = await getPermissionsByToken(realm, accessToken);
              // const userInfoObj = await getUserInfoByToken(realm, accessToken);

              res.status(HttpStatus.OK).json({ data: 'x' });
            } catch (e) {
              logger.error('device-route.get:', e);
              throw e;
            }
          },
        ],
      },
    ],
  };

  const authUserLogout = {
    mountPoint,
    name: 'auth-userinfo-route',
    path: ['/auth/logout'],
    handlers: [
      {
        method: 'get',
        middleware: [
          // checkDateTo,
          async (req, res) => {
            logger.debug('auth-userinfo-route');
            try {
              const { realm } = req.session;
              // if req.session... 
              req.session.destroy(function(err) {
                  console.log(err);
              })
  
              // return res.redirect(303,urlLogoutKeycloack(realm));

              res.status(HttpStatus.OK).json({ data: 'x' });
            } catch (e) {
              logger.error('device-route.get:', e);
              throw e;
            }
          },
        ],
      },
    ],
  };


  return [auth, authReturn, authUserInfo, authUserLogout];
};
