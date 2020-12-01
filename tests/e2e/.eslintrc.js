const path = require('path');
const absoluteSynpressNodeModulesPath = path.join(
	process.cwd(),
	'/node_modules/@synthetixio/synpress'
);

module.exports = {
	extends: `${absoluteSynpressNodeModulesPath}/.eslintrc.js`,
};
