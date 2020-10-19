// next.config.js
const withPlugins = require('next-compose-plugins');
const withImages = require('next-images');
const path = require('path');

// SVG path for svg-react-loader
const inlineSvgPaths = [path.resolve(__dirname, 'assets/inline-svg')];

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
	trailingSlash: true,
	exportPathMap: function (defaultPathMap) {
		return {
			...defaultPathMap,
			'/dashboard': {
				page: '/dashboard/[[...tab]]',
			},
			'/exchange': {
				page: '/exchange/[[...market]]',
			},
		};
	},
});
