import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en.json";
import es from "./locales/es.json";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "es"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "gk-language",
      caches: ["localStorage"],
    },
  });

const updateHtmlLang = () => {
  document.documentElement.lang = i18n.language?.startsWith("es") ? "es" : "en";
};
updateHtmlLang();
i18n.on("languageChanged", updateHtmlLang);

export default i18n;
