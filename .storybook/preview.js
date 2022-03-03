import React from 'react';
import { CustomThemeProvider } from '../contexts/CustomThemeContext';
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

export const decorators = [
	(Story) => (
		<CustomThemeProvider>
			<Story />
		</CustomThemeProvider>
	),
];
