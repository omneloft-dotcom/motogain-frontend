import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files from mobile (source of truth)
import tr from "../../../cordy-mobile/src/i18n/locales/tr.json";
import en from "../../../cordy-mobile/src/i18n/locales/en.json";

const resources = {
  tr: {
    translation: tr,
  },
  en: {
    translation: en,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "tr", // Default language
    fallbackLng: "tr",
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
