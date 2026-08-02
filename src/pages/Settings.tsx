import { useState } from "react";
import { DatabaseBackup, LockKeyhole, Server, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PageHeader } from "@/components/Common";
import { dealStorage } from "@/services/dealStorage";

const Settings = () => {
  const [resetOpen, setResetOpen] = useState(false);

  const resetData = () => {
    dealStorage.reset();
    toast.success("Prototype data reset", { description: "The original synthetic sample deals have been restored." });
  };

  return (
    <>
      <PageHeader title="Settings" subtitle="Review prototype configuration and planned connections." />
      <div className="grid gap-4 lg:grid-cols-3">
        {[
          { icon: Server, title: "Deal storage", value: "Browser local storage", description: "Prototype deal data remains in this browser until Supabase is connected." },
          { icon: LockKeyhole, title: "Document storage", value: "Metadata only", description: "File contents are not uploaded, read, or retained in this version." },
          { icon: Sparkles, title: "Deal analysis", value: "Sample Analysis", description: "Synthetic results are loaded for workflow testing. No external AI service or API key is connected." },
        ].map(({ icon: Icon, title, value, description }) => (
          <section key={title} className="rounded-xl border border-[#DDE3E8] bg-white p-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><Icon className="h-5 w-5" /></div>
            <h2 className="mt-4 font-extrabold text-[#16365D]">{title}</h2>
            <p className="mt-2 inline-flex rounded-full bg-[#F0FDF0] px-2.5 py-1 text-xs font-bold text-[#3A9738]">{value}</p>
            <p className="mt-3 text-sm leading-relaxed text-[#667085]">{description}</p>
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-[#DDE3E8] bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700"><DatabaseBackup className="h-5 w-5" /></div>
            <div><h2 className="font-extrabold text-[#16365D]">Prototype Data</h2><p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#667085]">Remove locally created deals and restore the original synthetic sample records. This action does not affect any external system.</p></div>
          </div>
          <Button variant="outline" onClick={() => setResetOpen(true)} className="shrink-0 rounded-lg border-red-200 font-bold text-red-700 hover:bg-red-50 hover:text-red-800">Reset Prototype Data</Button>
        </div>
      </section>

      <ConfirmationDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset all prototype data?" description="Locally created and edited deals will be removed, and the original synthetic sample deals will be restored." confirmLabel="Reset Prototype Data" onConfirm={resetData} />
    </>
  );
};

export default Settings;
