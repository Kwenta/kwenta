// next.config.js
const gitRevision = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

module.exports = {
	env: {
		GIT_HASH_ID: gitRevision,
	},
	webpack: (config, options) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];
		config.resolve.alias.https = 'https-browserify';
		config.resolve.alias.http = 'http-browserify';

		config.resolve.alias.os = 'os-browserify';

		config.module.rules.push({
			test: /\.svg$/,
			use: ['@svgr/webpack'],
		});
		return config;
	},
	future: {
		webpack5: true,
	},
	trailingSlash: !!process.env.NEXT_PUBLIC_DISABLE_PRETTY_URLS,
	exportPathMap: function (defaultPathMap) {
		return {
			...defaultPathMap,
			'/dashboard': {
				page: '/dashboard/[[...tab]]',
			},
			// '/exchange': {
			// 	page: '/exchange/[[...market]]',
			// },
		};
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/dashboard',
				permanent: true,
			},
		];
	},
};
