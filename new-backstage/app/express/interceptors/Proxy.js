const {
  ConfigManager: { getConfig }, Logger,
} = require('@dojot/microservice-sdk');

const { createProxyMiddleware } = require('http-proxy-middleware');


const logger = new Logger('backstage:express/interceptors/Proxy');

// const { graphql: configGraphql } = getConfig('BACKSTAGE');


// http://localhost:8000/backstage/v1/proxy/device
// http://apigw:8000/device

/**
 * Middleware graphql
 * @param {string} mountPoint
 * @returns
 */
module.exports = ({ mountPoint }) => ({
  name: 'proxy',
  path: `${mountPoint}/proxy`,
  middleware: [
    (req, res, next) => {
      // inject token obtained from the session
      req.token = req.session.accessToken;
      return next();
    },
    createProxyMiddleware(
      {
        target: 'http://apigw:8000',
        logLevel: 'debug',
        // option.logLevel
        // option.logProvider:
        logProvider: (provider) => {
          // add custom header to request
          // const myCustomProvider = {
          //   log: logger.debug,
          //   debug: logger.debug,
          //   info: logger.info,
          //   warn: logger.warn,
          //   error: logger.error,
          // };
          const myCustomProvider = {
            log: console.log,
            debug: console.log,
            info: console.log,
            warn: console.log,
            error: console.error,
          };
          return myCustomProvider;
          // Authorization: `Bearer ${token}`,
          // or log the req
        },
        changeOrigin: true,
        pathRewrite: {
          '^/backstage/v1/proxy': '', // rewrite path
          //      '^/api/remove/path': '/path', // remove base path
        },
        onProxyReq: (proxyReq, req, res) => {
          // add custom header to request
          proxyReq.setHeader('Authorization', `Bearer ${req.token}`);
          // Authorization: `Bearer ${token}`,
          // or log the req
        },
        // ssl: {
        //     key: fs.readFileSync('valid-ssl-key.pem', 'utf8'),
        //     cert: fs.readFileSync('valid-ssl-cert.pem', 'utf8')
        //   },
        // option.secure
      },
    ),
  ],
});
