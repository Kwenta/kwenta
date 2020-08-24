// next.config.js
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const path = require('path');

// SVG path for svg-react-loader
const svgPath = path.resolve(__dirname, 'assets/svg');

const plugins = [
	withImages({
		exclude: svgPath,
		webpack(config, options) {
			config.module.rules.push({
				test: /\.(svg)$/,
				include: svgPath,
				loader: 'svg-react-loader',
			});
			return config;
		},
	}),
];

module.exports = withPlugins([...plugins], {
	env: {
		// for testing purposes
		INFURA_PROJECT_ID: '7c7c98ab969c41568b5991fe1a06633c',
		BN_ONBOARD_API_KEY: '70015a31-1125-4f17-8b12-e56548202d3f',
		BN_NOTIFY_API_KEY: '95a4ea13-9af6-4ea1-89db-a2c333236a77',
		PORTIS_APP_ID: '26e198be-a8bb-4240-ad78-ae88579085bc',
	},
});
