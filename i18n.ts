import { DEFAULT_LANGUAGE } from 'constants/defaults';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from 'translations/constants';

import enTranslation from './translations/en.json';
import esTranslation from './translations/es.json';

// TODO: lazy load it
i18n.use(initReactI18next).init({
	resources: {
		[Language.EN]: { translation: enTranslation },
		[Language.ES]: { translation: esTranslation },
	},
	fallbackLng: Language.EN,
	lng: DEFAULT_LANGUAGE,
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
});
export const onlyCapitalizeInEnglish = () => (i18n.language === 'en' ? 'capitalize' : 'unset');
export default i18n;
