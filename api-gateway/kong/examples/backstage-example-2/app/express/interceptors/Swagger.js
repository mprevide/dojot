const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const { Logger } = require('@dojot/microservice-sdk');

const logger = new Logger('backstage:express/interceptors/Swagger');

const openApiFilePath = path.join(__dirname, '../../../api/v1.yml');

// https://www.npmjs.com/package/swagger-to-graphql

let openApiJson = null;
try {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  openApiJson = yaml.safeLoad(fs.readFileSync(openApiFilePath, 'utf8'));
  logger.debug(`OpenApi Json load: ${JSON.stringify(openApiJson)}`);
} catch (e) {
  logger.error('Some error when try load open api in yaml', e);
  throw e;
}

/**
 * Middleware TODO
 */
module.exports = ({ mountPoint }) => ({
  name: 'swagger-ui',
  path: `${mountPoint}/api-docs`,
  middleware: [
    swaggerUi.serve,
    swaggerUi.setup(openApiJson)],
});
