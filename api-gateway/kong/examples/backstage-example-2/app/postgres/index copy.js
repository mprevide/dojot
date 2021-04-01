const { Pool } = require('pg');
// const config = require('../config');

const pool = new Pool({
  host: 'postgres',
  port: 5432,
  user: 'backstage',
  database: 'backstage',
  password: 'backstage',
});

const userPool = new Pool({
  host: 'postgres',
  port: 5432,
  user: 'backstage',
  database: 'backstage',
  password: 'backstage',
});

module.exports = { pool, userPool };
