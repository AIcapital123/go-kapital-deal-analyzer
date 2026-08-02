import { useRef, useState } from "react";
import { FileStack, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

const acceptedExtensions = ["pdf", "jpg", "jpeg", "png"];

export const FileUploader = ({ onFiles, onError }: { onFiles: (files: File[]) => void; onError: (message: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const processFiles = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    const valid = files.filter((file) => acceptedExtensions.includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
    if (valid.length !== files.length) onError("Only PDF, JPG, JPEG, and PNG files can be added.");
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
      <p className="mt-4 text-xs text-[#667085]">PDF, JPG, JPEG, or PNG • File contents are not retained in this prototype</p>
    </div>
  );
};
