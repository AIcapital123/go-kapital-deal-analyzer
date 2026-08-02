import { createRoot } from "react-dom/client";
import { Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/i18n";
import App from "./App.tsx";
import "./globals.css";

createRoot(document.getElementById("root")!).render(
  <Suspense fallback="Loading...">
    <I18nextProvider i18n={i18n}>
      <App />
    </I18nextProvider>
  </Suspense>,
);
