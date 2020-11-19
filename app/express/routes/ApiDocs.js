const { Logger } = require('@dojot/microservice-sdk');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

const apiSpec = path.join(__dirname, '../../../api/swagger.yml');
const swaggerDocument = YAML.load(apiSpec);

// const logger = new Logger('influxdb-retriever:express/routes/api-docs');

/**
 * Routes to tss endpoints (time series service)
 *
 * @param {string} mountPoint be used as a route prefix
 * @param {Promise<{result: object, totalItems: number}| error>>}
 *                               A promise that returns a result e a totalItems inside that result
 *
 */
module.exports = ({ mountPoint }) => {
  /**
   * This feature returns data for an attribute with time
   * filter, pagination and order
   */
  const apiDocsRoute = {
    mountPoint,
    name: 'api-docs-route',
    path: ['/api'],
    handlers: [
      // {
      //   // method: 'get',
      //   middleware: swaggerUi.serve,
      // },
      {
        method: 'get',
        middleware: [//swaggerUi.serve[0],
          swaggerUi.setup(swaggerDocument),
        ],
      },
    ],
  };

  return [apiDocsRoute];
};
