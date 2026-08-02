import { FileText, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { documentCategories } from "@/services/documentStorage";
import { formatFileSize } from "@/lib/format";
import type { Document, DocumentCategory } from "@/types/deal";

export const DocumentList = ({ documents, onCategoryChange, onRemove }: { documents: Document[]; onCategoryChange: (id: string, category: DocumentCategory) => void; onRemove: (id: string) => void }) => {
  if (!documents.length) return null;

  return (
    <div className="mt-5 overflow-hidden rounded-xl border border-[#DDE3E8] bg-white">
      <div className="border-b border-[#E7EBEF] px-4 py-3"><h3 className="text-sm font-extrabold text-[#16365D]">Uploaded files <span className="ml-1 text-[#667085]">({documents.length})</span></h3></div>
      <div className="divide-y divide-[#E7EBEF]">
        {documents.map((document) => (
          <div key={document.id} className="grid gap-3 p-4 md:grid-cols-[minmax(220px,1fr)_minmax(220px,280px)_120px_42px] md:items-center">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EEF3F8] text-[#16365D]"><FileText className="h-5 w-5" /></div>
              <div className="min-w-0"><p className="truncate text-sm font-bold text-[#16365D]">{document.name}</p><p className="mt-0.5 text-xs text-[#667085]">{document.type} • {formatFileSize(document.size)}</p></div>
            </div>
            <div>
              <label htmlFor={`category-${document.id}`} className="mb-1 block text-xs font-semibold text-[#667085] md:sr-only">Document category</label>
              <Select value={document.category} onValueChange={(value) => onCategoryChange(document.id, value as DocumentCategory)}>
                <SelectTrigger id={`category-${document.id}`} className="h-9 rounded-lg border-[#DDE3E8] text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{documentCategories.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <span className="inline-flex w-fit rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">Ready</span>
            <button type="button" onClick={() => onRemove(document.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#667085] hover:bg-red-50 hover:text-red-600" aria-label={`Remove ${document.name}`}><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
};
