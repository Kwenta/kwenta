// next.config.js

module.exports = {
	webpack: (config, options) => {
		config.module.rules.push({
        test: /\.(png|jp(e*)g|svg|gif)$/,
        use: [
          {
            loader: 'optimized-images-loader',
            options: {
							includeStrategy: 'react'
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
