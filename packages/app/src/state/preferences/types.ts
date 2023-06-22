import { Language } from 'translations/constants'

import { ThemeName } from 'styles/theme'

export type PreferncesState = {
	currentTheme: ThemeName
	language: Language
	currency: {
		asset: 'USD'
		sign: '$'
		description: 'US Dollars'
		name: 'sUSD'
	}
}
