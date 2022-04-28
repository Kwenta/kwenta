import React from 'react';
import Select from 'components/Select';
import { CustomThemeContext } from 'contexts/CustomThemeContext';

const themes = {
	light: 'Light',
	dark: 'Dark',
	elite: 'Elite',
};

const ThemeSelect: React.FC = () => {
	const { currentTheme, setTheme } = React.useContext(CustomThemeContext);

	const themesObject = React.useMemo(() => {
		return Object.entries(themes).map(([themeName, themeLabel]) => ({
			label: themeLabel,
			value: themeName,
		}));
	}, []);

	return (
		<Select
			inputId="theme-options"
			formatOptionLabel={(option) => <span>{option.label}</span>}
			options={themesObject}
			value={{ label: themes[currentTheme], value: currentTheme }}
			onChange={(option) => {
				// @ts-ignore
				setTheme(option.value);
			}}
		/>
	);
};

export default ThemeSelect;
