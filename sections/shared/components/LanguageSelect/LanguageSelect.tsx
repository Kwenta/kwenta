import { useMemo, FC } from 'react';

import Select from 'components/Select';

import { languageState } from 'store/app';

import usePersistedRecoilState from 'hooks/usePersistedRecoilState';

import { useTranslation } from 'react-i18next';
import { Language } from 'translations/constants';

export const LanguageSelect: FC = () => {
	const { t } = useTranslation();
	const [language, setLanguage] = usePersistedRecoilState(languageState);

	const languages = t('languages', { returnObjects: true }) as Record<Language, string>;

	const languageOptions = useMemo(
		() =>
			Object.entries(languages).map(([langCode, langLabel]) => ({
				value: langCode as Language,
				label: langLabel,
			})),
		[languages]
	);

	return (
		<Select
			inputId="language-options"
			formatOptionLabel={(option) => <span>{option.label}</span>}
			options={languageOptions}
			value={{ label: languages[language], value: language }}
			onChange={(option) => {
				if (option) {
					// @ts-ignore
					setLanguage(option.value);
				}
			}}
		/>
	);
};

export default LanguageSelect;
