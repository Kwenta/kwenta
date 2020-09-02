// next.config.js
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const path = require('path');

// SVG path for svg-react-loader
const inlineSvgPaths = [
	path.resolve(__dirname, 'assets/svg'),
	path.resolve(__dirname, 'node_modules/@synthetixio/assets'),
];

const plugins = [
	withImages({
		exclude: inlineSvgPaths,
		webpack(config, options) {
			config.module.rules.push({
				test: /\.(svg)$/,
				include: inlineSvgPaths,
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
