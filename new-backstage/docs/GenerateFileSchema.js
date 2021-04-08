const { writeFileSync } = require('fs');
const { typeDefs } = require('../../graphql/Schema');

writeFileSync(`${__dirname}/schemaDoc.graphql`, (typeDefs));
