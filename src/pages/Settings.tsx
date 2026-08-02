import { LockKeyhole, Server, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/Common";

const Settings = () => (
  <>
    <PageHeader title="Settings" subtitle="Review prototype configuration and planned connections." />
    <div className="grid gap-4 lg:grid-cols-3">
      {[
        { icon: Server, title: "Deal storage", value: "Browser local storage", description: "Prototype deal data remains in this browser until Supabase is connected." },
        { icon: LockKeyhole, title: "Document storage", value: "Metadata only", description: "File contents are not uploaded or retained in this version." },
        { icon: Sparkles, title: "Deal analysis", value: "Simulated prototype", description: "No external AI service or API key is connected." },
      ].map(({ icon: Icon, title, value, description }) => (
        <section key={title} className="rounded-xl border border-[#DDE3E8] bg-white p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><Icon className="h-5 w-5" /></div>
          <h2 className="mt-4 font-extrabold text-[#16365D]">{title}</h2>
          <p className="mt-2 inline-flex rounded-full bg-[#F0FDF0] px-2.5 py-1 text-xs font-bold text-[#3A9738]">{value}</p>
          <p className="mt-3 text-sm leading-relaxed text-[#667085]">{description}</p>
        </section>
      ))}
    </div>
  </>
);

export default Settings;
