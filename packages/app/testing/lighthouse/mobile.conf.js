/** @type {LH.Config.Json} */
const config = {
	extends: 'lighthouse:default',
	settings: {
		emulatedFormFactor: 'mobile',
		scores: {
			performance: 80,
			accessibility: 80,
			'best-practices': 80,
			seo: 80,
		},
		onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
	},
}

module.exports = config
