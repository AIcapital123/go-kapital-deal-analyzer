import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DatabaseBackup, LockKeyhole, Server, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PageHeader } from "@/components/Common";
import { dealStorage } from "@/services/dealStorage";

const Settings = () => {
  const { t } = useTranslation();
  const [resetOpen, setResetOpen] = useState(false);
  const resetData = () => {
    dealStorage.reset();
    toast.success(t("settings.resetSuccess"), { description: t("settings.resetSuccessDesc") });
  };
  return (
    <>
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <div className="grid gap-4 lg:grid-cols-3">
        {[{ icon: Server, title: t("settings.dealStorage"), value: t("settings.browserStorage"), desc: t("settings.dealStorageDesc") },
          { icon: LockKeyhole, title: t("settings.docStorage"), value: t("settings.metadataOnly"), desc: t("settings.docStorageDesc") },
          { icon: Sparkles, title: t("settings.dealAnalysis"), value: t("settings.sampleAnalysis"), desc: t("settings.dealAnalysisDesc") }].map(({ icon: Icon, title, value, desc }) => (
          <section key={title} className="rounded-xl border border-[#DDE3E8] bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-4 font-extrabold text-[#16365D]">{title}</h2>
            <p className="mt-2 inline-flex rounded-full bg-[#F0FDF0] px-2.5 py-1 text-xs font-bold text-[#3A9738]">{value}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#667085]">{desc}</p>
          </section>
        ))}
      </div>
      <section className="mt-6 rounded-xl border border-[#DDE3E8] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><DatabaseBackup className="h-5 w-5" /></div>
            <div><h2 className="font-extrabold text-[#16365D]">{t("settings.prototypeData")}</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#667085]">{t("settings.prototypeDataDesc")}</p></div>
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)} className="shrink-0 rounded-lg border-red-200 font-bold text-red-700 hover:bg-red-50 hover:text-red-800">{t("settings.reset")}</Button>
        </div>
      </section>
      <ConfirmationDialog open={resetOpen} onOpenChange={setResetOpen} title={t("settings.resetTitle")} description={t("settings.resetDesc")} confirmLabel={t("settings.resetConfirm")} onConfirm={resetData} />
    </>
  );
};

export default Settings;