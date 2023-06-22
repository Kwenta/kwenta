import { ThemeName } from 'styles/theme'
import { Language } from 'translations/constants'

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
