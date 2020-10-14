module.exports = {
	ci: {
		collect: {
			numberOfRuns: 3,
			settings: {
				configPath: 'tests/lighthouse/mobile.conf.js',
				plugins: ['lighthouse-plugin-field-performance', 'lighthouse-plugin-social-sharing'],
				chromeFlags:
					'--headless --no-sandbox --ignore-certificate-errors --disable-gpu --incognito disable-dev-shm-usage',
			},
			url: [`${process.env.BASE_URL}`, `${process.env.BASE_URL}/exchange`],
		},
		assert: {
			preset: 'lighthouse:no-pwa',
		},
		upload: {
			target: 'filesystem',
			githubToken: process.env.GH_TOKEN,
			githubStatusContextSuffix: '-kwenta',
			outputDir: 'lighthouse-mobile-report',
		},
	},
};
