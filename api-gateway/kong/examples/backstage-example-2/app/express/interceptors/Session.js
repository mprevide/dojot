const { Logger } = require('@dojot/microservice-sdk');
const session = require('express-session');
const createError = require('http-errors');
const RedisStore = require('../../redis/StoreExpressSession')(session);
// https://www.npmjs.com/package/csurf TODO

const logger = new Logger('backstage:express/interceptors/Session');
const secret = 'aabcde ddd';
const cookieName = 'dojot-backstage-cookie';
const cookieHTTPS = false;
const cookiePath = '/';
const proxy = true;
const domain = 'localhost';

/**
 *  TODO
 * @param {*} keycloak
 * @param {*} req
 */
async function renewAccessTokenIfNecessary(keycloak, req) {
  logger.debug('renewAccessTokenIfNecessary: accessTokenExpiresAt=', req.session.accessTokenExpiresAt);
  if ((Date.now() > new Date(req.session.accessTokenExpiresAt).getTime())) {
    logger.debug('renewAccessTokenIfNecessary: Getting a new token...');
    const {
      accessToken,
      refreshToken,
      refreshExpiresAt,
      accessTokenExpiresAt,
    } = await keycloak.getTokenByRefreshToken(
      req.session.realm,
      req.session.refreshToken,
    );

    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;
    req.session.refreshExpiresAt = refreshExpiresAt;
    req.session.accessTokenExpiresAt = accessTokenExpiresAt;
    logger.debug('renewAccessTokenIfNecessary: ...got a new token.');
  }
}


/**
 * Middleware to TODO
 */
module.exports = ({
  keycloak,
  redis,
  mountPoint,
}) => ({
  name: 'session-express-interceptor',
  middleware:
  [session({
    secret,
    name: cookieName, // TODO
    domain, // TODO
    proxy, // TODO
    store: new RedisStore({ redis }),
    resave: false, // TODO // Forces the session to be saved back to the session store, even if the session was never modified
    // rolling: true, //Call touch,  Force the session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
    saveUninitialized: false, // TODO // Forces a session that is "uninitialized" to be saved to the store.
    cookie: {
      path: cookiePath, // Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
      httpOnly: true, // Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
      secure: cookieHTTPS, // TODO // Assegura que o navegador só envie o cookie por HTTPS.
      sameSite: 'strict', // TODO  // Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
    },
  }),
  async (req, res, next) => {
    logger.debug(`Receiving requisition for: ${req.path}`);

    // These routes do not require Token access in the session
    if (req.path === `${mountPoint}/auth`
      || req.path === `${mountPoint}/auth/return`
      || req.path === `${mountPoint}/auth/logout`
    ) {
      return next();
    }
    const err = new createError.Unauthorized();
    // These routes require Token access in the session
    if (req.session.accessToken && req.session.accessTokenExpiresAt) {
      try {
        // Get a new access token with the refresh token
        // if the current access token is expired
        await renewAccessTokenIfNecessary(keycloak, req);
      } catch (e) {
        err.message = 'It was not possible to renew the token.';
        return next(err);
      }
      return next();
    }
    // If  do not find a session with access
    // token returns that was not authorized
    err.message = 'There is no valid session.';
    return next(err);
  },
  ],
});
