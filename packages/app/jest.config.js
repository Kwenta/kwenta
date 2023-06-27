const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

const customJestConfig = {
	roots: ['<rootDir>', 'src'],
	modulePaths: ['<rootDir>', 'src'],
	moduleDirectories: ['node_modules', 'src'],
	moduleNameMapper: {
		'@kwenta/sdk/types': '<rootDir>/../sdk/dist/types',
		'@kwenta/sdk/utils': '<rootDir>/../sdk/dist/utils',
		'@kwenta/sdk/constants': '<rootDir>/../sdk/dist/constants',
		'@kwenta/sdk/contracts': '<rootDir>/../sdk/dist/contracts',
		'@kwenta/sdk/data': '<rootDir>/../sdk/dist/data',
		'@kwenta/sdk/services': '<rootDir>/../sdk/dist/services',
		'@kwenta/sdk/queries': '<rootDir>/../sdk/dist/queries',
		'@kwenta/sdk/common': '<rootDir>/../sdk/dist/common',
	},
	globalSetup: './testing/unit/setup/global.js',
	setupFilesAfterEnv: ['./testing/unit/setup/setup.js'],
	testEnvironment: 'jest-environment-jsdom',
	transform: {
		'^.+\\.(svg)$': `jest-transformer-svg`,
	},
}

const getCustomConfig = async () => {
	// Delete next js module name mapper transform and use above svg
	// transformer to avoid errors with svg and styled components
	const config = await createJestConfig(customJestConfig)()
	delete config['moduleNameMapper']['^.+\\.(svg)$']
	config.transformIgnorePatterns = []
	return config
}

module.exports = getCustomConfig()
