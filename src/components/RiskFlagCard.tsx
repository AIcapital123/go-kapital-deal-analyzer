import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { SourceEvidenceList } from "@/components/SourceEvidenceList";
import { cn } from "@/lib/utils";
import type { RiskFlag } from "@/types/deal";

const styles = {
  High: { border: "border-red-200", bg: "bg-red-50", text: "text-red-800", badge: "bg-red-100 text-red-800", icon: AlertCircle },
  Medium: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-900", badge: "bg-amber-100 text-amber-900", icon: AlertTriangle },
  Low: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-800", badge: "bg-blue-100 text-blue-800", icon: Info },
};

export const RiskFlagCard = ({ flag }: { flag: RiskFlag }) => {
  const style = styles[flag.severity];
  const Icon = style.icon;
  return (
    <article className={cn("rounded-xl border p-4", style.border, style.bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.text)} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h3 className={cn("font-extrabold", style.text)}>{flag.title}</h3><span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", style.badge)}>{flag.severity} severity</span></div>
          <p className="mt-2 text-sm leading-relaxed text-[#475467]">{flag.explanation}</p>
          <dl className="mt-3 grid gap-3 border-t border-black/5 pt-3 text-xs sm:grid-cols-2">
            <div><dt className="font-bold uppercase tracking-wide text-[#667085]">Source document</dt><dd className="mt-1 text-[#344054]">{flag.sourceDocument}</dd></div>
            <div><dt className="font-bold uppercase tracking-wide text-[#667085]">Recommended manual review</dt><dd className="mt-1 text-[#344054]">{flag.recommendation}</dd></div>
          </dl>
          {flag.sourceEvidence?.length ? <div className="mt-3"><SourceEvidenceList evidence={flag.sourceEvidence} compact /></div> : null}
        </div>
      </div>
    </article>
  );
};
