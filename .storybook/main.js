const path = require('path');

module.exports = {
	stories: ['../stories/**/*.stories.mdx', '../stories/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-postcss'],
	framework: '@storybook/react',
	webpackFinal: async (config) => {
		config.resolve.modules = [...(config.resolve.modules || []), path.resolve(__dirname, '../')];

		return config;
	},
	staticDirs: ['../public'],
	core: {
		builder: 'webpack5',
	},
};
