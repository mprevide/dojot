
const path = require('path');
const OpenApiValidator = require('express-openapi-validator');

const apiSpec = path.join(__dirname, '../../../api/swagger.yml');

/**
 * Middleware to validate request/response based in openapi 3.0
 */
module.exports = () => ({
  name: 'validator-interceptor',
  middleware: OpenApiValidator.middleware({
    apiSpec,
    validateRequests: true,
    validateResponses: true,
  }),
});
