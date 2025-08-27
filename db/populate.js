const { argv } = require('node:process');
const { populate } = require('./manage');

async function main() {
  await populate(argv[2]);
}

main();
