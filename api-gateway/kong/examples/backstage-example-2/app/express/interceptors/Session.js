const session = require('express-session');
const createError = require('http-errors');
const RedisStore = require('../../redis/StoreExpressSession')(session);
// https://www.npmjs.com/package/csurf
/**
 * Middleware to validate request/response based in openApi 3.0
 */
module.exports = () => ({
  name: 'session-express-interceptor',
  middleware:
  [session({
    secret: 'aabcde ddd',
    store: new RedisStore(),
    // resave: true,
    // saveUninitialized: true,
    cookie: {
      path: '/', // Specifies the value for the Path Set-Cookie. By default, this is set to '/', which is the root path of the domain
      httpOnly: true, // Specifies the boolean value for the HttpOnly Set-Cookie attribute. When truthy, the HttpOnly attribute is set, otherwise it is not. By default, the HttpOnly attribute is set.
      secure: false, // Assegura que o navegador só envie o cookie por HTTPS.
      // maxAge: null, //Specifies the number (in milliseconds) to use when calculating the Expires Set-Cookie attribute. This is done by taking the current server time and adding maxAge milliseconds to the value to calculate an Expires datetime. By default, no maximum age is set.
      // sameSite:  'strict', // Specifies the boolean or string to be the value for the SameSite Set-Cookie attribute.
    },
  }),
  // (req, res, next) => {
  //   const err = new createError.Unauthorized();

  //   if (req.path === '/auth') {
  //     return next();
  //   }

  //   if (req.session) {
  //     return next();
  //   }
  //   err.message = 'ERROR';
  //   return next(err);
  // }
],
});
