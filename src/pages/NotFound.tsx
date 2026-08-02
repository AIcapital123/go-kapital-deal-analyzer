import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center rounded-xl border border-[#DDE3E8] bg-white p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><FileQuestion className="h-7 w-7" /></div>
      <p className="mt-5 text-xs font-extrabold uppercase tracking-widest text-[#4AB547]">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-[#16365D]">{t("notFound.title")}</h1>
      <p className="mt-2 text-sm text-[#667085]">{t("notFound.msg")}</p>
      <Button onClick={() => navigate("/")} className="mt-5 rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]"><ArrowLeft className="mr-2 h-4 w-4" />{t("common.backToDashboard")}</Button>
    </div>
  );
};

export default NotFound;