import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/LanguageToggle";

export const AuthLayout = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#16365D] px-4 py-8">
      <div className="absolute right-4 top-4">
        <LanguageToggle />
      </div>
      <div className="mb-8 flex flex-col items-center">
        <img src="/brand/gokapital-logo.png" alt="GoKapital" className="h-12 w-auto" />
        <p className="mt-2 text-sm font-semibold text-white/80">{t("nav.dealAnalyzer")}</p>
      </div>
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl">
        {children}
      </div>
    </div>
  );
};