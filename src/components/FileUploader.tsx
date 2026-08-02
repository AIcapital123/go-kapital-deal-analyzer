import { useRef, useState } from "react";
import { FileStack, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Document } from "@/types/deal";

const acceptedExtensions = ["pdf", "jpg", "jpeg", "png"];
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_DOCUMENTS = 20;

export const FileUploader = ({ documents, onFiles, onError }: { documents: Document[]; onFiles: (files: File[]) => void; onError: (message: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (list: FileList | null) => {
    const incoming = Array.from(list ?? []);
    const valid: File[] = [];
    const errors = new Set<string>();
    const seenNames = new Set(documents.map((document) => document.name.toLowerCase()));

    incoming.forEach((file) => {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
      const normalizedName = file.name.toLowerCase();

      if (!acceptedExtensions.includes(extension)) {
        errors.add("Only PDF, JPG, JPEG, and PNG files can be added.");
      } else if (file.size > MAX_FILE_SIZE) {
        errors.add(`${file.name} exceeds the 25 MB file limit.`);
      } else if (seenNames.has(normalizedName)) {
        errors.add(`${file.name} was skipped because a file with that name is already selected.`);
      } else if (documents.length + valid.length >= MAX_DOCUMENTS) {
        errors.add("A deal can contain a maximum of 20 documents.");
      } else {
        valid.push(file);
        seenNames.add(normalizedName);
      }
    });

    onError([...errors].join(" "));
    if (valid.length) onFiles(valid);
  };

  return (
    <div
      className={cn("rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors", dragging ? "border-[#4AB547] bg-[#F3FBF3]" : "border-[#C9D2DA] bg-[#FAFBFC] hover:border-[#9BAEBC]")}
      onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => { event.preventDefault(); setDragging(false); processFiles(event.dataTransfer.files); }}
    >
      <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={(event) => { processFiles(event.target.files); event.target.value = ""; }} aria-label="Choose deal documents" />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#EAF6EA] text-[#3A9738]"><UploadCloud className="h-7 w-7" /></div>
      <h3 className="mt-4 font-extrabold text-[#16365D]">Drag and drop deal documents</h3>
      <p className="mt-1 text-sm text-[#667085]">or choose multiple files from your computer</p>
      <button type="button" onClick={() => inputRef.current?.click()} className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-[#BFC9D2] bg-white px-4 text-sm font-bold text-[#16365D] hover:bg-slate-50">
        <FileStack className="h-4 w-4" />Choose files
      </button>
      <p className="mt-4 text-xs text-[#667085]">PDF, JPG, JPEG, or PNG • 25 MB per file • {documents.length} of 20 selected</p>
      <p className="mt-1 text-xs text-[#98A2B3]">File contents are not retained in this prototype.</p>
    </div>
  );
};
