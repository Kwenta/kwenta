// next.config.js
const gitRevision = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

const withOptimizedImages = require('next-optimized-images');

module.exports = withOptimizedImages({
	inlineImageLimit: 8192,
	imagesFolder: 'images',
	imagesName: '[name]-[hash].[ext]',
	handleImages: ['jpeg', 'png', 'svg', 'webp', 'gif'],
	removeOriginalExtension: false,
	optimizeImages: true,
	optimizeImagesInDev: true,
	responsive: {
		adapter: require('responsive-loader/sharp'),
	},
	mozjpeg: {
		quality: 80,
	},
	optipng: {
		optimizationLevel: 3,
	},
	pngquant: false,
	gifsicle: {
		interlaced: true,
		optimizationLevel: 3,
	},
	svgo: {
		// enable/disable svgo plugins here
	},
	webp: {
		preset: 'default',
		quality: 75,
	},
	env: {
		GIT_HASH_ID: gitRevision,
	},
	webpack: (config, options) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];

		// config.module.rules.push({
		// 	test: /\.(png|jp(e*)g|svg|gif|webp)$/,
		// 	use: [
		// 		{
		// 			loader: 'optimized-images-loader',
		// 			options: {
		// 				includeStrategy: 'react',
		// 				publicPath: `/_next/static/images/`,
		// 				outputPath: 'static/images',
		// 			},
		// 		},
		// 	],
		// });
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
});
