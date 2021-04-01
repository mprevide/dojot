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
    graphqlHTTP({
      schema: rootSchema,
      graphiql: true, // graphql interface
    })],
});
