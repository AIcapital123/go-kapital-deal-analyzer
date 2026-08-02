import type { Document, DocumentCategory } from "@/types/deal";

export const documentCategories: DocumentCategory[] = [
  "Business loan application",
  "Bank statement",
  "Tax return",
  "Profit and loss statement",
  "Balance sheet",
  "Driver’s license",
  "Voided check",
  "Other supporting document",
];

const detectCategory = (name: string): DocumentCategory => {
  const value = name.toLowerCase();
  if (value.includes("bank") || value.includes("statement")) return "Bank statement";
  if (value.includes("tax") || value.includes("1120")) return "Tax return";
  if (value.includes("application")) return "Business loan application";
  if (value.includes("profit") || value.includes("p&l")) return "Profit and loss statement";
  if (value.includes("balance")) return "Balance sheet";
  if (value.includes("license") || value.includes("id")) return "Driver’s license";
  if (value.includes("check")) return "Voided check";
  return "Other supporting document";
};

// Stores metadata only. Replace with uploads to private Supabase Storage buckets.
export const filesToDocuments = (files: File[]): Document[] =>
  files.map((file, index) => ({
    id: `doc-${Date.now()}-${index}`,
    name: file.name,
    type: file.name.split(".").pop()?.toUpperCase() || file.type || "File",
    category: detectCategory(file.name),
    size: file.size,
    uploadDate: new Date().toISOString(),
    uploadStatus: "ready",
    processingStatus: "pending",
  }));
