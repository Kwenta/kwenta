/**
 * @type {import('next').NextConfig}
 */
const gitRevision = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

// https://github.com/facebookexperimental/Recoil/issues/733#issuecomment-925072943
const intercept = require('intercept-stdout');

// safely ignore recoil stdout warning messages
function interceptStdout(text) {
	if (text.includes('Duplicate atom key')) {
		return '';
	}
	return text;
}

// Intercept in dev and prod
intercept(interceptStdout);

const withPlugins = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');

module.exports = withPlugins([
	[
		optimizedImages,
		{
			/* config for next-optimized-images (use default) */
			imagesFolder: 'images',
			imagePublicPolder: '/_next/static/images',
			imageOutputPath: '/static/images',
		},
	],
	{
		env: {
			GIT_HASH_ID: gitRevision,
		},
		images: {
			disableStaticImages: true,
		},
		webpack: (config, options) => {
			config.resolve.mainFields = ['module', 'browser', 'main'];

			config.module.rules.push(
				{
					loader: '@svgr/webpack',
					options: {
						prettier: false,
						svgo: true,
						svgoConfig: {
							plugins: [
								{
									name: 'preset-default',
									params: {
										overrides: { removeViewBox: false },
									},
								},
							],
						},
						titleProp: true,
					},
					test: /\.svg$/,
				},
				{
					test: /\.png/,
					type: 'asset/resource',
				}
			);

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
	},
]);
