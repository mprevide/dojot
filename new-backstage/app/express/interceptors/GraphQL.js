// const expressGraphQL = require('express-graphql');
const { graphqlHTTP } = require('express-graphql');

const { Logger } = require('@dojot/microservice-sdk');
const rootSchema = require('../../graphql/Schema');

const logger = new Logger('backstage:express/interceptors/Swagger');

/**
 * Middleware TODO
 */
module.exports = ({ mountPoint }) => ({
  name: 'graphql',
  path: `${mountPoint}/graphql`,
  middleware: [
    (req, res, next) => {
      req.token = req.session.accessToken;
      return next();
    },
    graphqlHTTP({
      schema: rootSchema,
      graphiql: { headerEditorEnabled: true }, // TODO defaultQuery?: string;
      customFormatErrorFn: (error) => ({
        message: error.message,
        locations: error.locations,
        // stack: error.stack ? error.stack.split('\n') : [],
        // path: error.path,
      })
    }),
  ],
});
