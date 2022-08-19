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
const withTM = require('next-transpile-modules')(['echarts', 'zrender']);

const plugins = [
	withTM,
	// [
	// 	optimizedImages,
	// 	{
	// 		/* config for next-optimized-images (use default) */
	// 		imagesFolder: 'images',
	// 		imagePublicPolder: '/_next/static/images',
	// 		imageOutputPath: '/static/images',
	// 	},
	// ],
];

const nextConfig = {
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
};

module.exports = withPlugins([...plugins], nextConfig);
