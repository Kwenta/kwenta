const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

const customJestConfig = {
	roots: ['<rootDir>'],
	modulePaths: ['<rootDir>'],
	moduleDirectories: ['node_modules'],
	globalSetup: './test-setup/global.js',
	setupFilesAfterEnv: ['./test-setup/setup.js'],
	testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
