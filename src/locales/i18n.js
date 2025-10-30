import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './en';
import { ar } from './ar';

const resources = {
    en: { translation: en },
    ar: { translation: ar },
};

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: localStorage.getItem('language') || 'en',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

// Set RTL for Arabic
if (i18n.language === 'ar') {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';
} else {
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
}

// Listen for language changes
i18n.on('languageChanged', (lng) => {
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
});

export default i18n;
