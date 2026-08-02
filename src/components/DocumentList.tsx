import { useTranslation } from "react-i18next";
import { FileText, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { documentCategories, statementMonths } from "@/services/documentStorage";
import { formatFileSize } from "@/lib/format";
import type { Document, DocumentCategory } from "@/types/deal";

const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i + 1);

const catKey: Record<DocumentCategory, string> = {
  "Business loan application": "cat_business_loan_application",
  "Bank statement": "cat_bank_statement",
  "Tax return": "cat_tax_return",
  "Profit and loss statement": "cat_profit_and_loss",
  "Balance sheet": "cat_balance_sheet",
  "Driver’s license": "cat_drivers_license",
  "Voided check": "cat_voided_check",
  "Other supporting document": "cat_other",
};

export const DocumentList = ({ documents, onCategoryChange, onPeriodChange, onRemove }: {
  documents: Document[];
  onCategoryChange: (id: string, category: DocumentCategory) => void;
  onPeriodChange: (id: string, month?: number, year?: number) => void;
  onRemove: (id: string) => void;
}) => {
  const { t } = useTranslation();
  if (!documents.length) return null;
  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#DDE3E8] bg-white">
      <div className="border-b border-[#E7EBEF] px-4 py-3"><h3 className="text-sm font-extrabold text-[#16365D]">{t("documents.selectedFiles")} <span className="ml-1 text-[#667085]">({documents.length})</span></h3></div>
      <div className="divide-y divide-[#E7EBEF]">
        {documents.map((document) => (
          <div key={document.id} className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(220px,300px)_120px_42px] md:items-start">
            <div className="flex min-w-0 items-center gap-3 md:pt-0.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8] text-[#16365D]"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0"><p className="truncate text-sm font-bold text-[#16365D]">{document.name}</p><p className="mt-0.5 text-xs text-[#667085]">{document.type} • {formatFileSize(document.size)}</p></div>
            </div>
            <div className="space-y-2">
              <div>
                <label htmlFor={"category-" + document.id} className="mb-1 block text-xs font-semibold text-[#667085] md:sr-only">{t("documents.docCategory")}</label>
                <Select value={document.category} onValueChange={(value) => onCategoryChange(document.id, value as DocumentCategory)}>
                  <SelectTrigger id={"category-" + document.id} className="h-9 rounded-lg border-[#DDE3E8] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{documentCategories.map((cat) => <SelectItem key={cat} value={cat}>{t("documents." + catKey[cat])}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {document.category === "Bank statement" && (
                <div className="grid grid-cols-2 gap-2">
                  <div><label htmlFor={"month-" + document.id} className="mb-1 block text-[11px] font-bold text-[#667085]">{t("documents.stmtMonth")}</label><Select value={document.statementMonth ? String(document.statementMonth) : undefined} onValueChange={(value) => onPeriodChange(document.id, Number(value), document.statementYear)}><SelectTrigger id={"month-" + document.id} className="h-9 rounded-lg border-[#DDE3E8] text-xs"><SelectValue placeholder={t("documents.month")} /></SelectTrigger><SelectContent>{statementMonths.map((month, index) => <SelectItem key={month} value={String(index + 1)}>{month}</SelectItem>)}</SelectContent></Select></div>
                  <div><label htmlFor={"year-" + document.id} className="mb-1 block text-[11px] font-bold text-[#667085]">{t("documents.stmtYear")}</label><Select value={document.statementYear ? String(document.statementYear) : undefined} onValueChange={(value) => onPeriodChange(document.id, document.statementMonth, Number(value))}><SelectTrigger id={"year-" + document.id} className="h-9 rounded-lg border-[#DDE3E8] text-xs"><SelectValue placeholder={t("documents.year")} /></SelectTrigger><SelectContent>{years.map((year) => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent></Select></div>
                </div>
              )}
            </div>
            <span className="mt-1 inline-flex w-fit rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700">{document.processingStatus.replace("_", " ")}</span>
            <button type="button" onClick={() => onRemove(document.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-red-50 hover:text-red-600" aria-label={t("documents.removeFile", { name: document.name })}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};