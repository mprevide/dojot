const session = require('express-session');
const createError = require('http-errors');
const RedisStore = require('../../redis/StoreExpressSession')(session);
// https://www.npmjs.com/package/csurf
/**
 * Middleware to validate request/response based in openApi 3.0
 */
module.exports = ({ keycloack, redis }) => ({
  name: 'session-express-interceptor',
  middleware:
  [session({
    secret: 'aabcde ddd',
    name: 'dojot-backstage-cookie',
    // domain:
    // proxy: false
    store: new RedisStore({redis}),
    resave: false, // Forces the session to be saved back to the session store, even if the session was never modified
    // rolling: true, //Call touch,  Force the session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown.
    saveUninitialized: false, // Forces a session that is "uninitialized" to be saved to the store.
    cookie: {
      path: '/', // Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
      httpOnly: true, // Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
      secure: false, // Assegura que o navegador só envie o cookie por HTTPS.
      // maxAge: null, //Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute. This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, no maximum age is set.
      // sameSite:  'strict', // Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
    },
  }),
  async (req, res, next) => {
    console.log('MIDDLE 2', req.path);
    const err = new createError.Unauthorized();

    if (req.path === '/backstage/v1/auth') {
      console.log('/backstage/v1/auth');
      // regenerate call destroy
      // req.session.regenerate((err) => {
      //   console.log(err);
      // });
      return next();
    }
    if (req.path === '/backstage/v1/auth/return') {
      console.log('/backstage/v1/auth/return');
      return next();
    }

    if (req.path === '/backstage/v1/auth/logout') {
      console.log('/backstage/v1/auth/logout');
      return next();
    }

    console.log('req.session 2',req.session);
       // return next();
    if (req.session.accessToken && req.session.accessTokenExpiresAt) {
      console.log('Date.now()', new Date());
      console.log('accessTokenExpiresAt', new Date(req.session.accessTokenExpiresAt));

      if ((Date.now()> new Date(req.session.accessTokenExpiresAt).getTime())) {
        console.log('get a new token');
        try{
        const {
          accessToken,
          refreshToken,
          refreshExpiresAt,
          accessTokenExpiresAt,
        } = await keycloack.getApi().getTokenByRefreshToken(
          req.session.realm,
          req.session.refreshToken,
        );

        req.session.accessToken = accessToken;
        req.session.refreshToken = refreshToken;
        req.session.refreshExpiresAt = refreshExpiresAt;
        req.session.accessTokenExpiresAt = accessTokenExpiresAt;
        } catch(e){
          return next(e);
        }
      }
      return next();
    }
     
    //   // console.log('TOUCH 2', req.session.accessTokenExpiresAt);

    //   // req.session.touch(req.session.id, req.session);
    //   // req.session.touch(function(err) {
    //   //   console.log(err);
    //   // })
    //   console.log('call next');
    //   return next();
    //   // refresh time with touch
    // }
    err.message = 'TEST ERROR';
    return next(err);
  },
  ],
});
