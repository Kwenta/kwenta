import React from 'react';
import { ThemeProvider } from 'styled-components';

import theme from 'styles/theme';
import { themeColors } from 'styles/theme/colors';
import useLocalStorage from 'hooks/useLocalStorage';

export type ThemeName = keyof typeof themeColors;

type CustomThemeContextType = {
	currentTheme: ThemeName;
	setTheme(name: ThemeName): void;
};

export const CustomThemeContext = React.createContext<CustomThemeContextType>({
	currentTheme: 'dark',
	setTheme: () => {},
});

export const CustomThemeProvider: React.FC = ({ children }) => {
	const [customTheme, setTheme] = useLocalStorage<ThemeName>('currentTheme', 'dark');

	const themeObj = React.useMemo(
		() => ({
			...theme,
			colors: { ...theme.colors, selectedTheme: themeColors[customTheme] },
		}),
		[customTheme]
	);

	return (
		<CustomThemeContext.Provider value={{ currentTheme: customTheme, setTheme }}>
			<ThemeProvider theme={themeObj}>{children}</ThemeProvider>
		</CustomThemeContext.Provider>
	);
};

export const useSetTheme = () => {
	const { setTheme } = React.useContext(CustomThemeContext);

	return setTheme;
};
