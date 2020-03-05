const del = require('del');

module.exports = async function(config) {
  return del(config.dist, { force: true });
};
