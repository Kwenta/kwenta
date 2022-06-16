import React from 'react';
import { ThemeProvider } from 'styled-components';
import { themes } from '../styles/theme';
import '../styles/main.css';

export const parameters = {
	actions: { argTypesRegex: '^on[A-Z].*' },
	controls: {
		matchers: {
			color: /(background|color)$/i,
			date: /Date$/,
		},
	},
};

// TODO: Maybe implement custom theme switcher for Storybook.
export const decorators = [
	(Story) => (
		<ThemeProvider theme={themes.dark}>
			<Story />
		</ThemeProvider>
	),
];
