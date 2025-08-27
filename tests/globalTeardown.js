const pool = require('../db/pool');

module.exports = async function () {
  await pool.end();
};
