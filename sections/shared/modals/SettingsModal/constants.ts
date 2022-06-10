import LanguageSelect from 'sections/shared/components/LanguageSelect';
import ThemeSelect from 'sections/shared/components/ThemeSelect/ThemeSelect';

export const OPTIONS = [
	{
		id: 'language-options',
		label: 'modals.settings.options.language',
		SelectComponent: LanguageSelect,
	},
	{
		id: 'theme-options',
		label: 'modals.settings.options.theme',
		SelectComponent: ThemeSelect,
	},
];
