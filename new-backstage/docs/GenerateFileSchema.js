const { writeFileSync } = require('fs');
const { typeDefs } = require('new-backstage/app/graphql/Schema');

writeFileSync(`${__dirname}/schemaDoc.graphql`, (typeDefs));
