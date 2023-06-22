const isDev = process.env.BASE_URL.includes('vercel') ? true : false;

const conf = {
	ci: {
		collect: {
			numberOfRuns: 3,
			settings: {
				configPath: 'tests/lighthouse/mobile.conf.js',
				plugins: ['lighthouse-plugin-field-performance', 'lighthouse-plugin-social-sharing'],
				chromeFlags:
					'--headless --no-sandbox --ignore-certificate-errors --disable-gpu --incognito --disable-dev-shm-usage',
			},
			url: [
				`${process.env.BASE_URL}`,
				`${process.env.BASE_URL}/exchange`,
				`${process.env.BASE_URL}/dashboard`,
			],
		},
		assert: {
			assertMatrix: [
				{
					preset: 'lighthouse:no-pwa',
					matchingUrlPattern: `https://[^/]+/$`,
					assertions: {
						'categories:accessibility': ['warn', { minScore: 0.75 }],
						'categories:performance': ['error', { minScore: 0.25 }],
						'categories:seo': ['error', { minScore: 0.85 }],
						'categories:best-practices': ['error', { minScore: 0.85 }],
						'button-name': ['warn'],
						bypass: ['warn'],
						'html-has-lang': ['warn'],
						'link-name': ['warn'],
						'unused-javascript': 'off',

						// remove after fixed:
						'font-display': ['warn'],
						'offscreen-images': ['warn'],
						'total-byte-weight': ['warn'],
						'unsized-images': ['warn'],
						'uses-responsive-images': ['warn'],
					},
				},
				{
					preset: 'lighthouse:no-pwa',
					matchingUrlPattern: `https://[^/]+/exchange$`,
					assertions: {
						'categories:accessibility': ['warn', { minScore: 0.65 }],
						'categories:performance': ['error', { minScore: 0.25 }],
						'categories:seo': ['error', { minScore: 0.8 }],
						'categories:best-practices': ['error', { minScore: 0.85 }],
						'button-name': ['warn'],
						bypass: ['warn'],
						'html-has-lang': ['warn'],
						'link-name': ['warn'],
						'unused-javascript': 'off',
						'color-contrast': ['warn'],

						// remove after fixed:
						'font-display': ['warn'],
						'uses-rel-preconnect': ['warn'],
						'uses-text-compression': ['warn'],
						'aria-hidden-focus': ['warn'],
						'tap-targets': ['warn'],
					},
				},
			],
		},
		upload: {
			target: 'filesystem',
			githubToken: process.env.GH_TOKEN,
			githubStatusContextSuffix: '-kwenta',
			outputDir: 'lighthouse-mobile-report',
		},
	},
};

if (isDev) {
	for (const assertionObject of conf.ci.assert.assertMatrix) {
		assertionObject.assertions['is-crawlable'] = 'off';
	}
}

module.exports = conf;
