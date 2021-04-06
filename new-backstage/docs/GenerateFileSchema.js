const { writeFileSync } = require('fs');
const { typeDefs } = require('../graphql/Schema');

writeFileSync(`${__dirname}/schemaDoc.graphql`, (typeDefs));

// npm install -g @2fd/graphdoc

// node ./src/docs/GenerateFileSchema.js
// graphdoc -s ./src/docs/schemaDoc.graphql -o ./${VERSION} -f