import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language resources directly
import enResources from './locales/en';
import esResources from './locales/es';
import jaResources from './locales/ja';
import krResources from './locales/kr';

i18n
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      en: enResources,
      es: esResources,
      ja: jaResources,
      kr: krResources
    },
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: true,
    },
  });

export default i18n; 