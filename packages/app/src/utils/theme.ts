import { themes } from 'styles/theme'

export const getDesignTokens = (mode: 'dark' | 'light') => ({
	palette: {
		mode,
		colors: themes[mode].colors,
	},
})
