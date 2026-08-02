import type { LucideIcon } from "lucide-react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight text-[#16365D] sm:text-[28px]">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-[#667085] sm:text-base">{subtitle}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const SummaryCard = ({ label, value, helper, icon: Icon, tone = "navy" }: { label: string; value: string | number; helper: string; icon: LucideIcon; tone?: "navy" | "green" | "amber" }) => {
  const colors = {
    navy: "bg-[#EEF3F8] text-[#16365D]",
    green: "bg-[#EEF9EE] text-[#3A9738]",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="rounded-xl border border-[#DDE3E8] bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[#667085]">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#16365D]">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", colors[tone])}><Icon className="h-5 w-5" /></div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#667085]">{helper}</p>
    </div>
  );
};

export const LoadingState = ({ label = "Loading deal information…" }: { label?: string }) => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-[#DDE3E8] bg-white p-8 text-center">
    <LoaderCircle className="h-8 w-8 animate-spin text-[#4AB547]" />
    <p className="mt-3 text-sm font-semibold text-[#16365D]">{label}</p>
  </div>
);

export const EmptyState = ({ title, message, action }: { title: string; message: string; action?: ReactNode }) => (
  <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-[#C9D2DA] bg-white p-8 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><Inbox className="h-6 w-6" /></div>
    <h3 className="mt-4 font-bold text-[#16365D]">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-[#667085]">{message}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const ErrorMessage = ({ message }: { message: string }) => (
  <div role="alert" className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{message}</span>
  </div>
);

export const AnalysisSection = ({ title, description, actions, children }: { title: string; description?: string; actions?: ReactNode; children: ReactNode }) => (
  <section className="rounded-xl border border-[#DDE3E8] bg-white">
    <div className="flex flex-col gap-3 border-b border-[#E7EBEF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="font-extrabold text-[#16365D]">{title}</h2>
        {description && <p className="mt-1 text-xs text-[#667085]">{description}</p>}
      </div>
      {actions}
    </div>
    <div className="p-5">{children}</div>
  </section>
);
