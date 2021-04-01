/* eslint-disable camelcase */
/* eslint-disable no-multi-str */
const {
  Logger,
} = require('@dojot/microservice-sdk');
const { pool, userPool } = require('./index.js');


const logger = new Logger('backstage:mongodb');

// check if table exists
async function checkTable(table_name) {
  let query = {
    text: 'SELECT * FROM information_schema.tables WHERE table_name=$1;',
    values: [table_name],
  };
  try {
    const client = await userPool.connect();
    const result = await client.query(query);
    logger.debug('checkTable result', result);
    if (!result.rowCount) {
      logger.info(`Table ${table_name} not found.`);
      query = {
        text: 'CREATE TABLE user_config ( \
                    tenant varchar(255) NOT NULL, \
                    username varchar(255) NOT NULL, \
                    configuration json NOT NULL, \
                    last_update timestamp WITH time zone DEFAULT CURRENT_TIMESTAMP, \
                    CONSTRAINT unique_user PRIMARY KEY (tenant, username) \
                 );',
      };
      const result2 = await client.query(query);
      logger.debug('checkTable result2', result2);
    } else {
      logger.info(`Table ${table_name}  already exists.`);
    }
    logger.info(`Table ${table_name} is available to use.`);
    // process.exit();
  } catch (err) {
    logger.error('err', err);
    // throw err;
  }
}


// check if database exists
// async function checkDatabase(database_name) {
//   let query = {
//     text: 'SELECT * FROM pg_catalog.pg_database WHERE datname=$1;',
//     values: [database_name],
//   };
//   try {
//     const result = await pool.query(query);
//     logger.debug('checkDatabase result1', result);
//     if (!result.rowCount) {
//       logger.info('Database does not exist.');
//       query = {
//         text: `CREATE DATABASE ${database_name}`,
//       };
//       const result2 = await pool.query(query);
//       logger.debug('checkDatabase result2', result2);

//       logger.info('Successfully created database, proceeding to check table existence.');
//     } else {
//       logger.info(`Database ${database_name} already exists, proceeding to check table existence.`);
//     }
//     checkTable('user_config');
//   } catch (err) {
//     logger.error('err', err);
//     // process.exit(1);
//   } finally {
//     // pool.end();
//     // userPool.end();
//   }
// }

// pool.query('SELECT NOW()', (err, res) => {
//   if (err) {
//     logger.error(`Erro: ${err} ${res}`);
//     pool.end();
//     // process.exit(1);
//   }
// });

module.exports = checkTable;
