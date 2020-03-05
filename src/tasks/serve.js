const bs = require('browser-sync').create();
const build = require('./build.js');
const path = require('path');

module.exports = async function(config) {
  await build(config);

  // Watch for file changes
  bs.watch(path.join(config.docs, '**/*')).on('change', async () => {
    await build(config);
    bs.reload();
  });

  // Launch browser sync
  bs.init({
    logLevel: 'silent',
    notify: false,
    server: config.dist
  });
};
