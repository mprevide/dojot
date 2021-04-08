
const { ConfigManager, Logger, WebUtils } = require('@dojot/microservice-sdk');

const authRoutes = require('./routes/v1/Auth');
const openApiValidatorInterceptor = require('./interceptors/OpenApiValidator');
const graphQLInterceptor = require('./interceptors/GraphQL');
const sessionInterceptor = require('./interceptors/session/Session');
const commonErrorsHandle = require('./interceptors/CommonErrorsHandle');
const swaggerInterceptor = require('./interceptors/Swagger');

const logger = new Logger('backstage:express');

const {
  express: configExpress,
} = ConfigManager.getConfig('BACKSTAGE');

/**
 * Creates an express instance
 *
 * @param {an instance of @dojot/microservice-sdk.ServiceStateManager} serviceState
 *          Manages the services' states, providing health check and shutdown utilities.
 *
 * @param {string}mountPoint Start of all routes
 *
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
      // The order of the interceptors matters
      swaggerInterceptor({
        mountPoint,
      }),
      openApiValidatorInterceptor(),
      readinessInterceptor({
        stateManager: serviceState,
        logger,
      }),
      beaconInterceptor({
        stateManager: serviceState,
        logger,
      }),
      requestIdInterceptor(),
      requestLogInterceptor({
        logger,
      }),
      responseCompressInterceptor(),
      sessionInterceptor({
        mountPoint,
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
