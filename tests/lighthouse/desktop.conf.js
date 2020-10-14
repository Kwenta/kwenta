'use strict';

/** @type {LH.Config.Json} */
const config = {
	extends: 'lighthouse:default',
	settings: {
		emulatedFormFactor: 'desktop',
		throttling: {
			rttMs: 40,
			throughputKbps: 10240,
			cpuSlowdownMultiplier: 1,
		},
		scores: {
			performance: 80,
			accessibility: 80,
			'best-practices': 80,
			seo: 80,
		},
		onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
	},
};

module.exports = config;
