require('dotenv').config();
const { Pool } = require('pg');

const databaseUrl =
  process.env.NODE_ENV === 'test' ?
    process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

module.exports = new Pool({ connectionString: databaseUrl });
