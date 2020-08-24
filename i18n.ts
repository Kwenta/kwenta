import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './translations/en.json';

i18n.use(initReactI18next).init({
	resources: {
		en: { translation: enTranslation },
	},
	fallbackLng: 'en',
	lng: 'en',
	interpolation: {
		escapeValue: false, // react already safes from xss
	},
});

export default i18n;
