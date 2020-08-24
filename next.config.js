// next.config.js
const path = require('path');

module.exports = (phase, { defaultConfig }) => {
	return {
		webpack(config, options) {
			const { isServer } = options;
			defaultConfig = Object.assign({ inlineImageLimit: 8192, assetPrefix: '' }, defaultConfig);
			console.log(defaultConfig);
			config.module.rules.push({
				test: /\.(jpe?g|png|svg|gif|ico|webp|jp2)$/,
				// Next.js already handles url() in css/sass/scss files
				issuer: /\.\w+(?<!(s?c|sa)ss)$/i,
				exclude: defaultConfig.exclude,
				use: [
					{
						loader: require.resolve('url-loader'),
						options: {
							limit: defaultConfig.inlineImageLimit,
							fallback: require.resolve('file-loader'),
							publicPath: `${defaultConfig.assetPrefix}/_next/static/images/`,
							outputPath: `${isServer ? '../' : ''}static/images/`,
							name: '[name]-[hash].[ext]',
							esModule: defaultConfig.esModule || false,
						},
					},
				],
			});
			// config.module.rules.push({
			// 	test: /\.(svg)$/,
			// 	include: path.resolve(__dirname, 'assets/svg'),
			// 	loader: 'svg-react-loader',
			// });

			return config;
		},
		env: {
			// for testing purposes
			INFURA_PROJECT_ID: '7c7c98ab969c41568b5991fe1a06633c',
			BN_ONBOARD_API_KEY: '70015a31-1125-4f17-8b12-e56548202d3f',
			BN_NOTIFY_API_KEY: '95a4ea13-9af6-4ea1-89db-a2c333236a77',
			PORTIS_APP_ID: '26e198be-a8bb-4240-ad78-ae88579085bc',
		},
	};
};
