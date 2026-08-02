import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export const LanguageToggle = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith("es") ? "es" : "en";

  const toggle = () => {
    const next = current === "en" ? "es" : "en";
    void i18n.changeLanguage(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={i18n.t("language.toggle")}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border border-[#DDE3E8] bg-white px-3 py-1.5 text-sm font-bold text-[#16365D] transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4AB547] focus-visible:ring-offset-2",
        className,
      )}
    >
      <Globe className="h-4 w-4 text-[#667085]" />
      <span aria-hidden="true">{current === "en" ? "EN" : "ES"}</span>
      <span className="sr-only">/ {current === "en" ? "ES" : "EN"}</span>
    </button>
  );
};