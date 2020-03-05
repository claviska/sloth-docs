#!/usr/bin/env node

const chalk = require('chalk');
const program = require('commander');
const path = require('path');
const build = require('./src/tasks/build.js');
const clean = require('./src/tasks/clean.js');
const serve = require('./src/tasks/serve.js');

let userConfig;

try {
  userConfig = require(path.join(process.env.PWD, 'slothdocs.config.js'));
} catch (err) {
  console.log(err);
  userConfig = {};
}

const config = Object.assign(
  {
    docs: './docs',
    dist: './dist',
    sidebar: '_sidebar.md',
    plugins: [],
    theme: path.join(__dirname, 'src/themes/default')
  },
  userConfig
);

program
  .option('-b, --build', 'build the docs')
  .option('-c, --clean', 'remove all dist files')
  .option('-w, --serve', 'launch the dev server and watch files');

program.allowUnknownOption(false);
program.parse(process.argv);

if (program.build) {
  console.log(chalk.green('Sloths are building your docs... 🦥 📚'));
  build(config)
    .then(() => console.log(chalk.green('All files have been built. ✅')))
    .then(() => process.exit())
    .catch(err => console.error(chalk.red('An error occurred building your docs!', err)));
}

if (program.clean) {
  console.log('Cleaning up files! 🧹');
  clean(config)
    .then(() => console.log(chalk.green('All files have been cleaned. 🧹')))
    .then(() => process.exit())
    .catch(err => console.error(chalk.red('An error occurred cleaning your docs!', err)));
}

if (program.serve) {
  console.log(chalk.cyan('Dev server initialized! Your sloth is busy watching the docs. 🦥 📚'));
  serve(config).catch(err => console.error(chalk.red('Error serving files!', err)));
} else {
  console.error('The sloths are confused! 🦥\nSee --help for a list of available commands.');
  process.exit(1);
}
