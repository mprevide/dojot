const {
  ConfigManager: { getConfig }, Logger,
} = require('@dojot/microservice-sdk');

const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const { TestScheduler } = require('@jest/core');

// const logger = new Logger('backstage:express/interceptors/Proxy');


const configProxy = {
  target: 'http://apigw:8000',
  'log.level': 'debug',
  'ssl.key': 'valid-ssl-key.pem',
  'ssl.cert': 'valid-ssl-cert.pem',
  secure: false, // true/false, if you want to verify the SSL Certs
};
// const { graphql: configGraphql } = getConfig('BACKSTAGE');


// http://localhost:8000/backstage/v1/proxy/device
// http://apigw:8000/device

// const configFinal = {
//   ssl: {
//     key: fs.readFileSync('valid-ssl-key.pem', 'utf8'),
//     cert: fs.readFileSync('valid-ssl-cert.pem', 'utf8'),
//   },
// };

// const sslConfig = () => {
//   const config = {};

//   if (configProxy['ssl.key']) {
//     config.ssl.key = fs.readFileSync(configProxy['ssl.key'], 'utf8');
//   }

//   return config;
// };

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
        target: configProxy.target,
        logLevel: configProxy['log.level'],
        logProvider: () => new Logger('backstage:express/interceptors/Proxy'),
        changeOrigin: true,
        pathRewrite: (path) => path.replace(`${mountPoint}/proxy`, ''),
        onProxyReq: (proxyReq, req) => {
          proxyReq.setHeader('Authorization', `Bearer ${req.token}`);
        },
        secure: configProxy.secure,
        // TODO
        // ssl: {
        //     key: fs.readFileSync('valid-ssl-key.pem', 'utf8'),
        //     cert: fs.readFileSync('valid-ssl-cert.pem', 'utf8')
        //   },
        // option.secure
      },
    ),
  ],
});
