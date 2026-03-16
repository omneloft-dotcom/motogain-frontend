import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// Import translation files from web locale files
import tr from "./locales/tr.json";
import en from "./locales/en.json";

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
