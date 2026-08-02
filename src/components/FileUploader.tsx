import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileStack, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document } from "@/types/deal";

const acceptedExtensions = ["pdf", "jpg", "jpeg", "png"];
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_DOCUMENTS = 20;

export const FileUploader = ({ documents, onFiles, onError }: { documents: Document[]; onFiles: (files: File[]) => void; onError: (message: string) => void }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (list: FileList | null) => {
    const incoming = Array.from(list ?? []);
    const valid: File[] = [];
    const errors = new Set<string>();
    const seenNames = new Set(documents.map((d) => d.name.toLowerCase()));
    incoming.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const norm = file.name.toLowerCase();
      if (!acceptedExtensions.includes(ext)) errors.add(t("documents.errorType"));
      else if (file.size > MAX_FILE_SIZE) errors.add(t("documents.errorSize", { name: file.name }));
      else if (seenNames.has(norm)) errors.add(t("documents.errorDup", { name: file.name }));
      else if (documents.length + valid.length >= MAX_DOCUMENTS) errors.add(t("documents.errorMax"));
      else { valid.push(file); seenNames.add(norm); }
    });
    onError([...errors].join(" "));
    if (valid.length) onFiles(valid);
  };

  return (
    <div className={cn("rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors", dragging ? "border-[#4AB547] bg-[#F3FBF3]" : "border-[#C9D2DA] bg-[#FAFBFC] hover:border-[#9BAEBC]")}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); processFiles(e.dataTransfer.files); }}>
      <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(e) => { processFiles(e.target.files); e.target.value = ""; }} aria-label={t("documents.chooseDocs")} />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF6EA] text-[#3A9738]"><UploadCloud className="h-7 w-7" /></div>
      <h3 className="mt-4 font-extrabold text-[#16365D]">{t("documents.dragDrop")}</h3>
      <p className="mt-1 text-sm text-[#667085]">{t("documents.chooseMulti")}</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-[#BFC9D2] bg-white px-4 text-sm font-bold text-[#16365D] hover:bg-slate-50">
        <FileStack className="h-4 w-4" />{t("documents.chooseFiles")}
      </button>
      <p className="mt-4 text-xs text-[#667085]">{t("documents.fileTypes")} • {t("documents.perFile")} • {documents.length} {t("common.of")} 20 {t("documents.selected")}</p>
      <p className="mt-1 text-xs text-[#98A2B3]">{t("documents.notRetained")}</p>
    </div>
  );
};