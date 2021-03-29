
const { ConfigManager, Logger, WebUtils } = require('@dojot/microservice-sdk');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');


const authRoutes = require('./routes/v1/Auth');
const exampleRoutes = require('./routes/v1/Example');
const openApiValidatorInterceptor = require('./interceptors/OpenApiValidator');
const sessionInterceptor = require('./interceptors/session/Session');
const handleErrors = require('./interceptors/AxiosForKongAndKeycloackErrorsHandle');

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
module.exports = (serviceState, openApiFilePath, { keycloak, redis }) => {
  let openApiJson = null;
  try {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    openApiJson = yaml.safeLoad(fs.readFileSync(openApiFilePath, 'utf8'));
    logger.debug(`OpenApi Json load: ${JSON.stringify(openApiJson)}`);
  } catch (e) {
    logger.error('Some error when try load open api in yaml', e);
    throw e;
  }

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
      {
        name: 'swagger-ui',
        path: '/backstage/v1/api-docs',
        middleware: [swaggerUi.serve, swaggerUi.setup(openApiJson)],
      },
      // openApiValidatorInterceptor({ openApiFilePath }),
      sessionInterceptor({
        keycloak,
        redis,
        mountPoint: '/backstage/v1',
      }),
      requestIdInterceptor(),
      readinessInterceptor({
        stateManager: serviceState,
        logger,
      }),
      beaconInterceptor({
        stateManager: serviceState,
        logger,
      }),
      responseCompressInterceptor(),
      requestLogInterceptor({
        logger,
      }),
    ],
    routes: ([
      authRoutes({
        mountPoint: '/backstage/v1',
        keycloak,
      }),
      exampleRoutes({
        mountPoint: '/backstage/v1',
      }),
    ]).flat(),
    errorHandlers: [
      // The order of the error handlers matters
      handleErrors(),
      defaultErrorHandler({
        logger,
      }),
    ],
    logger,
    supportTrustProxy: configExpress.trustproxy,
    catchInvalidRequest: true,
  });
};
