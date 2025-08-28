const pool = require('../db/pool');

module.exports = async function () {
  // Give a small delay to let any pending operations complete
  await new Promise((resolve) => setTimeout(resolve, 100));

  await pool.end();

  // Force close any remaining handles
  process.exit(0);
};
