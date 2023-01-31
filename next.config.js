/**
 * @type {import('next').NextConfig}
 */
const gitRevision = require('child_process')
	.execSync('git rev-parse --short HEAD')
	.toString()
	.trim();

const { withPlugins } = require('next-compose-plugins');
const optimizedImages = require('next-optimized-images');
const transpile = require('next-transpile-modules');
const withTM = [transpile(['echarts', 'zrender'])];

const baseConfig = {
	env: {
		GIT_HASH_ID: gitRevision,
	},
	images: {
		disableStaticImages: true,
	},
	webpack: (config, options) => {
		config.resolve.mainFields = ['module', 'browser', 'main'];
		if (!options.isServer) {
			config.resolve.fallback = {
				fs: false,
			};
		}
		config.module.rules.push(
			{
				test: /\.svg$/,
				loader: '@svgr/webpack',
				options: {
					prettier: false,
					svgo: true,
					svgoConfig: {
						plugins: [
							{
								name: 'preset-default',
								params: {
									overrides: {
										removeViewBox: false,
										cleanupIDs: false,
									},
								},
							},
						],
					},
					titleProp: true,
				},
			},
			{
				test: /\.png/,
				type: 'asset/resource',
			}
		);

		return config;
	},
	trailingSlash: true,
	compiler: {
		// ssr and displayName are configured by default
		styledComponents: true,
	},
	experimental: { images: { unoptimized: true } },
	async redirects() {
		return [
			{
				source: '/dashboard/overview',
				destination: '/dashboard',
				permanent: true,
			},
			{
				source: '/market/:key',
				destination: '/market/?asset=:key',
				permanent: true,
			},
			{
				source: '/exchange/:base-:quote',
				destination: '/exchange/?quote=:quote&base=:base',
				permanent: true,
			},
		];
	},
	productionBrowserSourceMaps: true,
};

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
	baseConfig,
	...withTM,
]);
