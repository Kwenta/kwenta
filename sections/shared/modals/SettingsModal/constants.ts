import PriceCurrencySelect from 'sections/shared/components/PriceCurrencySelect';
import LanguageSelect from 'sections/shared/components/LanguageSelect';

export const OPTIONS = [
	{
		id: 'currency-options',
		label: 'modals.settings.options.currency',
		SelectComponent: PriceCurrencySelect,
	},
	{
		id: 'language-options',
		label: 'modals.settings.options.language',
		SelectComponent: LanguageSelect,
	},
];
