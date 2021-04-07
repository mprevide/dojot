
const { ConfigManager, Logger, WebUtils } = require('@dojot/microservice-sdk');
const helmet = require('helmet');
const nocache = require('nocache');

const authRoutes = require('./routes/v1/Auth');
const openApiValidatorInterceptor = require('./interceptors/OpenApiValidator');
const graphQLInterceptor = require('./interceptors/GraphQL');
const sessionInterceptor = require('./interceptors/session/Session');
const commonErrorsHandle = require('./interceptors/CommonErrorsHandle');

const logger = new Logger('backstage:express');

const {
  express: configExpress,
} = ConfigManager.getConfig('BACKSTAGE');

// https://www.npmjs.com/package/csurf TODO
/**
 * Creates an express instance
 *
 * @param {an instance of @dojot/microservice-sdk.ServiceStateManager} serviceState
 *          Manages the services' states, providing health check and shutdown utilities.
 *
 * @param {string}openApiFilePath FilePath to OpenApi
 *
 * @param TODO
 *
 * @throws  Some error when try load open api in yaml
 *
 * @returns {express}
 */
module.exports = (serviceState, mountPoint) => {
  const { defaultErrorHandler } = WebUtils.framework;

  const {
    responseCompressInterceptor,
    requestIdInterceptor,
    beaconInterceptor,
    requestLogInterceptor,
    readinessInterceptor,
  } = WebUtils.framework.interceptors;

  return WebUtils.framework.createExpress({
    interceptors: [
      // Helmet helps you secure your Express apps by setting various HTTP headers.
      // {
      //   name: 'helmet-interceptor',
      //   middleware: helmet(),
      // },
      // {
      //   name: 'no-cache-interceptor',
      //   middleware: nocache(),
      // },
      // (req, res, next) => {
      //   res.set('Cache-Control', 'no-store');
      //   next();
      // },
      // openApiValidatorInterceptor({ openApiFilePath }),
      sessionInterceptor({
        mountPoint,
      }),
      requestIdInterceptor(),
      // readinessInterceptor({
      //   stateManager: serviceState,
      //   logger,
      // }),
      beaconInterceptor({
        stateManager: serviceState,
        logger,
      }),
      responseCompressInterceptor(),
      requestLogInterceptor({
        logger,
      }),
      graphQLInterceptor({
        mountPoint,
      }),
    ],
    routes: ([
      authRoutes({
        mountPoint,
      }),
    ]).flat(),
    errorHandlers: [
      // The order of the error handlers matters
      commonErrorsHandle(),
      defaultErrorHandler({
        logger,
      }),
    ],
    logger,
    supportTrustProxy: configExpress.trustproxy,
    catchInvalidRequest: true,
  });
};
