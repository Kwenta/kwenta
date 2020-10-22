import { DEFAULT_LANGUAGE } from 'constants/defaults';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from 'translations/constants';

import enTranslation from './translations/en.json';
import krTranslation from './translations/kr.json';

// TODO: lazy load it
i18n.use(initReactI18next).init({
	resources: {
		[Language.EN]: { translation: enTranslation },
		[Language.KR]: { translation: krTranslation },
	},
	fallbackLng: Language.EN,
	lng: DEFAULT_LANGUAGE,
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
});

export default i18n;
