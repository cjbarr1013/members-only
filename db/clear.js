const { argv } = require('node:process');
const { clear } = require('./manage');

async function main() {
  await clear(argv[2]);
}

main();
