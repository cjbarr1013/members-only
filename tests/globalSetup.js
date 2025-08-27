require('dotenv').config();
const { clear, populate } = require('../db/manage');

module.exports = async function () {
  await clear(process.env.TEST_DATABASE_URL);
  await populate(process.env.TEST_DATABASE_URL);
};
