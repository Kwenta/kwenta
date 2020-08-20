// next.config.js
const path = require('path');

module.exports = {
	webpack(config) {
		config.module.rules.push({
			test: /\.(svg)$/,
			include: path.resolve(__dirname, 'assets/svg'),
			loader: 'svg-react-loader',
		});

		return config;
	},
	env: {
		BN_ONBOARD_API_KEY: '70015a31-1125-4f17-8b12-e56548202d3f',
		BN_NOTIFY_API_KEY: '95a4ea13-9af6-4ea1-89db-a2c333236a77',
		PORTIS_APP_ID: '26e198be-a8bb-4240-ad78-ae88579085bc',
	},
};
