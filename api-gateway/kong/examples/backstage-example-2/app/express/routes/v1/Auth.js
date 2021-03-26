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
            logger.info('auth-route');
            // logger.info('auth-route.get: req.params=', req.params);
            // logger.info('auth-route.get: req.query=', req.query);
            // logger.info('auth-route.get: req.sessionID=', req.sessionID);

            try {

              const { tenant, state } = req.query;
              const newState = state ? 'login-state' : state;

              const { codeVerifier, codeChallenge } = generatePKCEChallenge();
              const url = keycloack.buildUrlLogin(
                'gui', // TODO
                newState,
                tenant,
                codeChallenge,
                'S256', // TODO
              );

              req.session.codeChallenge = codeChallenge;
              req.session.codeVerifier = codeVerifier;
              req.session.realm = tenant;
              req.session.tenant = tenant;

              return res.redirect(303, url);

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
            logger.info('auth-return-route');
            // logger.info('auth-return-route: req.params=', req.params);
            // logger.info('auth-return-route: req.query=', req.query);

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
                try{
                const {
                  accessToken,
                  // expiresIn,
                  // refreshExpiresIn,
                  refreshToken,
                  refreshExpiresAt,
                  accessTokenExpiresAt,
                } = await keycloack.getApi().getTokenByAuthorizationCode(
                  realm,
                  authorizationCode,
                  codeVerifier,
                );

                req.session.accessToken = accessToken;
                // req.session.expiresIn = expiresIn;
                // req.session.refreshExpiresIn = refreshExpiresIn;
                req.session.refreshToken = refreshToken;
                req.session.refreshExpiresAt = refreshExpiresAt;
                req.session.accessTokenExpiresAt = accessTokenExpiresAt;

                console.log('RETURN TO RETURN');
                return res.redirect(303, 'http://localhost:8000/return?state='+state);
                }catch(e){
                  req.session.destroy((err) => {
                    console.log(err);
                  });

                  return res.redirect(303, 'http://localhost:8000/return?error='+e);
                }
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
            logger.info('auth-userinfo-route');
            try {
              const permissionsArr = await  keycloack.getApi().getPermissionsByToken(realm, accessToken);
              const userInfoObj = await  keycloack.getApi().getUserInfoByToken(realm, accessToken);

              const result = {
                permissions: permissionsArr,
                ... userInfoObj
              }

              return res.status(HttpStatus.OK).json(result);

            } catch (e) {
              logger.error('device-route.get:', e);
              return res.status(HttpStatus.UNAUTHORIZED)
                    .json({error: 'There is no active session'});
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
            logger.info('auth-userinfo-route');
            try {
              const { realm } = req.session;
              // if req.session...
              req.session.destroy((err) => {
                console.log(err);
              });

              // return res.redirect(303,urlLogoutKeycloack(realm));

              // res.status(HttpStatus.OK).json({ data: 'x' });
              return res.redirect(303, 'http://localhost:8000/');
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
