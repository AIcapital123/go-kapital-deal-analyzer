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

export const statementMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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

const detectStatementPeriod = (name: string) => {
  const normalized = name.toLowerCase();
  const month = statementMonths.findIndex((label) => normalized.includes(label.toLowerCase()) || normalized.includes(label.slice(0, 3).toLowerCase()));
  const year = normalized.match(/20\d{2}/)?.[0];
  return month >= 0 && year ? { statementMonth: month + 1, statementYear: Number(year), period: `${statementMonths[month]} ${year}` } : {};
};

export const getStatementWarnings = (documents: Document[]) => {
  const statements = documents.filter((document) => document.category === "Bank statement");
  const warnings: string[] = [];
  const completePeriods = statements.filter((document) => document.statementMonth && document.statementYear);

  if (statements.length > completePeriods.length) {
    warnings.push("Add a statement month and year to every bank statement.");
  }

  const counts = new Map<string, number>();
  completePeriods.forEach((document) => {
    const key = `${document.statementYear}-${document.statementMonth}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  counts.forEach((count, key) => {
    if (count > 1) {
      const [year, month] = key.split("-").map(Number);
      warnings.push(`Duplicate statement month: ${statementMonths[month - 1]} ${year}.`);
    }
  });

  const periods = [...new Set(completePeriods.map((document) => document.statementYear! * 12 + document.statementMonth! - 1))].sort((a, b) => a - b);
  for (let index = 1; index < periods.length; index += 1) {
    const gap = periods[index] - periods[index - 1] - 1;
    if (gap > 0) {
      const missing = Array.from({ length: gap }, (_, offset) => periods[index - 1] + offset + 1)
        .map((value) => `${statementMonths[value % 12]} ${Math.floor(value / 12)}`)
        .join(", ");
      warnings.push(`Missing statement month${gap > 1 ? "s" : ""}: ${missing}.`);
    }
  }

  return warnings;
};

// Stores metadata only. Replace with uploads to private Supabase Storage buckets.
export const filesToDocuments = (files: File[]): Document[] =>
  files.map((file, index) => {
    const category = detectCategory(file.name);
    return {
      id: `doc-${Date.now()}-${index}`,
      name: file.name,
      type: file.name.split(".").pop()?.toUpperCase() || file.type || "File",
      category,
      size: file.size,
      ...(category === "Bank statement" ? detectStatementPeriod(file.name) : {}),
      uploadDate: new Date().toISOString(),
      uploadStatus: "ready",
      processingStatus: "selected",
    };
  });
