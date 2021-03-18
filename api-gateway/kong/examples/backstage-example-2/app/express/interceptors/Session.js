const session = require('express-session');
const RedisStore = require('../../redis/StoreExpressSession')(session);

/**
 * Middleware to validate request/response based in openApi 3.0
 */
module.exports = () => ({
  name: 'session-express-interceptor',
  middleware:
  session({
    secret: 'aabcde ddd',
    store: new RedisStore(),
    // resave: true,
    // saveUninitialized: true,
    // cookie: {
    //   path: '/',
    //   httpOnly: true,
    //   secure: false,
    //   // maxAge: null,
    //   sameSite: 'strict',
    // },
  }),
});
