// next.config.js

module.exports = {
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
			'/exchange': {
				page: '/exchange/[[...market]]',
			},
		};
	},
};
