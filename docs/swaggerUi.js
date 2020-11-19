const express = require('express');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const { Logger } = require('@dojot/microservice-sdk');

const logger = new Logger('influxdb-retriever:docs/swaggerUi');

const app = express();
const apiSpec = path.join(__dirname, '../api/swagger.yml');
const swaggerDocument = YAML.load(apiSpec);

app.use('/tss/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const port = 3001;

app.listen(port, () => {
  logger.info(`Example app listening at http://localhost:${port}/tss/api-docs`);
});
