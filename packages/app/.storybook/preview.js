import React from 'react'
import { ThemeProvider } from 'styled-components'
import { createTheme, MuiThemeProvider } from '@material-ui/core'
import { themes } from 'styles/theme'
import 'styles/main.css'
import { getDesignTokens } from 'utils/theme'
import * as NextImage from 'next/image'

const OriginalNextImage = NextImage.default

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
}

Object.defineProperty(NextImage, 'default', {
	configurable: true,
	value: (props) => <OriginalNextImage {...props} unoptimized />,
})

// TODO: Maybe implement custom theme switcher for Storybook.
export const decorators = [
	(Story) => (
		<ThemeProvider theme={themes.dark}>
			<MuiThemeProvider theme={createTheme(getDesignTokens('dark'))}>
				<Story />
			</MuiThemeProvider>{' '}
		</ThemeProvider>
	),
]
