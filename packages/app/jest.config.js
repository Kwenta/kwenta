const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
	roots: ['<rootDir>'],
	modulePaths: ['<rootDir>'],
	moduleDirectories: ['node_modules'],
	globalSetup: './testing/unit/setup/global.js',
	setupFilesAfterEnv: ['./testing/unit/setup/setup.js'],
	testEnvironment: 'jest-environment-jsdom',
	transform: {
		'^.+\\.(svg)$': `jest-transformer-svg`,
	},
};

const getCustomConfig = async () => {
	// Delete next js module name mapper transform and use above svg
	// transformer to avoid errors with svg and styled components
	const config = await createJestConfig(customJestConfig)();
	delete config['moduleNameMapper']['^.+\\.(svg)$'];
	return config;
};

module.exports = getCustomConfig();
