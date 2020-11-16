const isDev = process.env.BASE_URL.includes('vercel') ? true : false;

const conf = {
	ci: {
		collect: {
			numberOfRuns: 3,
			settings: {
				configPath: 'tests/lighthouse/desktop.conf.js',
				plugins: ['lighthouse-plugin-field-performance', 'lighthouse-plugin-social-sharing'],
				chromeFlags:
					'--headless --no-sandbox --ignore-certificate-errors --disable-gpu --incognito --disable-dev-shm-usage',
			},
			url: [`${process.env.BASE_URL}`, `${process.env.BASE_URL}/exchange`],
		},
		assert: {
			assertMatrix: [
				{
					preset: 'lighthouse:no-pwa',
					matchingUrlPattern: `https://[^/]+/$`,
					assertions: {},
				},
				{
					preset: 'lighthouse:no-pwa',
					matchingUrlPattern: `https://[^/]+/exchange$`,
					assertions: {},
				},
			],
		},
		upload: {
			target: 'filesystem',
			githubToken: process.env.GH_TOKEN,
			githubStatusContextSuffix: '-kwenta',
			outputDir: 'lighthouse-desktop-report',
		},
	},
};

if (isDev) {
	for (const assertionObject of conf.ci.assert.assertMatrix) {
		assertionObject.assertions['is-crawlable'] = 'off';
	}
}

module.exports = conf;
