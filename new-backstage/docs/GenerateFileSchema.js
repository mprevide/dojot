const { writeFileSync } = require('fs');
const { typeDefs } = require('../app/graphql/Schema');

writeFileSync(`${__dirname}/schemaDoc.graphql`, (typeDefs));
