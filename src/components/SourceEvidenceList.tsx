import { FileSearch } from "lucide-react";
import type { SourceEvidence } from "@/types/deal";

export const SourceEvidenceList = ({ evidence, compact = false }: { evidence?: SourceEvidence[]; compact?: boolean }) => {
  if (!evidence?.length) return <span className="text-xs text-[#98A2B3]">No sample evidence</span>;

  return (
    <div className="space-y-2">
      {evidence.map((item, index) => (
        <details key={`${item.documentId}-${item.pageNumber}-${index}`} className="group rounded-lg border border-[#DDE3E8] bg-white">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-bold text-[#16365D] hover:bg-[#F8FAFB]">
            <FileSearch className="h-3.5 w-3.5 text-[#4AB547]" />
            <span className="min-w-0 flex-1 truncate">{compact ? "Sample evidence" : item.documentName} · p. {item.pageNumber}</span>
            <span className="rounded-full bg-[#EEF3F8] px-2 py-0.5 text-[10px] uppercase text-[#667085]">{item.extractionMethod}</span>
          </summary>
          <div className="border-t border-[#E7EBEF] px-3 py-2.5 text-xs leading-relaxed text-[#475467]">
            <p>“{item.evidenceText}”</p>
            <p className="mt-2 font-semibold text-[#667085]">Sample confidence: {Math.round(item.confidence * 100)}%</p>
          </div>
        </details>
      ))}
    </div>
  );
};
