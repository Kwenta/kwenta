const path = require('path');

module.exports = {
	stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
	framework: '@storybook/react',
	webpackFinal: async (config) => {
		config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, '../')];
		const fileLoaderRule = config.module.rules.find((rule) => rule.test && rule.test.test('.svg'));
		fileLoaderRule.exclude = /\.svg$/;

		config.module.rules.push({
			test: /\.svg$/,
			enforce: 'pre',
			loader: require.resolve('@svgr/webpack'),
		});

		config.resolve.fallback = {
			path: false,
			stream: false,
			crypto: require.resolve('crypto-browserify'),
		};

		return config;
	},
	staticDirs: ['../public'],
	core: {
		builder: 'webpack5',
	},
};
