import animations from './animations'
import colors, { themeColors } from './colors'
import fonts from './fonts'

const theme = { colors, fonts, animations }

export type ThemeName = keyof typeof themeColors

export const wrapTheme = (name: ThemeName) => ({
	...theme,
	colors: {
		...theme.colors,
		selectedTheme: themeColors[name],
	},
})

export type ThemeInterface = ReturnType<typeof wrapTheme>

export const themes = {
	light: wrapTheme('light'),
	dark: wrapTheme('dark'),
	// elite: wrapTheme('elite'),
}

export default theme
