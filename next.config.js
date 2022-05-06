// next.config.js
const gitRevision = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

module.exports = {
	env: {
		GIT_HASH_ID: gitRevision,
	},
	images: {
		disableStaticImages: true,
	},
	webpack: (config, options) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];

		config.module.rules.push({
			test: /\.(png|jp(e*)g|svg|gif|webp)$/,
			use: [
				{
					loader: 'optimized-images-loader',
					options: {
						includeStrategy: 'react',
						publicPath: `/_next/static/images/`,
						outputPath: 'static/images',
					},
				},
			],
		});
		return config;
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
