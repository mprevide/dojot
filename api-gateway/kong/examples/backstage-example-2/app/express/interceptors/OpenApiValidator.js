
const OpenApiValidator = require('express-openapi-validator');

/**
 * Middleware to validate request/response based in openApi 3.0
 */
module.exports = ({ openApiFilePath }) => ({
  name: 'validator-interceptor',
  middleware: OpenApiValidator.middleware({
    apiSpec: openApiFilePath,
    validateRequests: true,
    validateResponses: false,
  }),
});
