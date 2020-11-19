
const { ConfigManager, Logger } = require('@dojot/microservice-sdk');
const camelCase = require('lodash.camelcase');
const { createHttpTerminator } = require('http-terminator');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

const ServerFactory = require('../sdk/web/server-factory');
const ExpressFactory = require('../sdk/web/framework/express-factory');

const logger = new Logger('influxdb-retriever:express/index');

const requestIdInterceptor = require('../sdk/web/framework/interceptors/request-id-interceptor');
const responseCompressInterceptor = require('../sdk/web/framework/interceptors/response-compress-interceptor');
const beaconInterceptor = require('../sdk/web/framework/interceptors/beacon-interceptor');
const paginateInterceptor = require('./interceptors/CustomPaginator');
const dojotTenantJwtParseInterceptor = require('./interceptors/DojotTenantJwtParse');
const openApiValidatorInterceptor = require('./interceptors/OpenApiValidator');

const apiDocsRoutes = require('./routes/ApiDocs');

const defaultErrorHandler = require('../sdk/web/framework/backing/default-error-handler');

const { server: configServer, paginate: configPaginate } = ConfigManager.getConfig('RETRIEVER');

const configServerCamelCase = ConfigManager
  .transformObjectKeys(configServer, camelCase);

/**
 * Creates a server with express and receives the routes to register
 *
 * @param {object[]} routes Array of object with object
 * @param {string} routes[].mountPoint  Mount Point from routes
 * @param {string} routes[].name Name of route
 * @param {string[]]} routes[].path  Path for route
 * @param {object[]]} routes[].handlers Handles for path
 * @param {string='get','put','post','patch', 'delete', ...]} routes[].handlers.method
 *                                                      Verb http For handlers
 * @param {((req: any, res: any, next: any) => any)[]} routes[].handlers.middleware
 *                                                      Function to handle the verb http
 * @param {ServiceStateManager}  serviceState
 *                               This is a instance from @dojot/microservice-sdk/ServiceStateManager
 */
module.exports = (routes, serviceState) => {
  routes.push(apiDocsRoutes({
    mountPoint: '/tss',
  }));
  const express = ExpressFactory({
    interceptors: [
      swaggerUi.serve,
      configServer.cors ? {
        name: 'cors',
        middleware: cors(),
      } : {},
      // dojotTenantJwtParseInterceptor(),
      paginateInterceptor({
        defaultLimit: configPaginate['default.max.limit'],
        maxLimit: configPaginate['default.max.limit'],
      }),
      //openApiValidatorInterceptor(),
      requestIdInterceptor({}),
      beaconInterceptor({
        stateManager: serviceState,
        logger,
      }),
      responseCompressInterceptor({
        config: {},
      }),
    ],
    routes: (routes).flat(),
    errorHandlers: [
      defaultErrorHandler({ logger }),
    ],
    logger,
    config: {
      ...configServer,
    },
  });

  const server = ServerFactory({ config: configServerCamelCase, logger });

  serviceState.registerService('server');
  server.on('request', express);
  server.on('listening', () => {
    logger.info('Server ready to accept connections!');
    logger.info(server.address());
    serviceState.signalReady('server');
  });
  server.on('close', () => {
    serviceState.signalNotReady('server');
  });
  server.on('error', (e) => {
    logger.error('Server experienced an error:', e);
  });
  server.listen(configServer.port, configServer.host);

  // create an instance of http-terminator and instead of
  // using server.close(), use httpTerminator.terminate()
  const httpTerminator = createHttpTerminator({ server });

  // register handlers to gracefully shutdown http server...
  serviceState.registerShutdownHandler(async () => {
    logger.debug('Stopping the server from accepting new connections...');
    await httpTerminator.terminate();
    logger.debug('The server no longer accepts connections!');
  });
};
