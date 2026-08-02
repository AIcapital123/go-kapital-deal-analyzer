import i18n from "@/i18n";

const getLocale = (): string => (i18n.language?.startsWith("es") ? "es-US" : "en-US");

export const formatCurrency = (value: number, compact = false): string =>
  new Intl.NumberFormat(getLocale(), {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
    notation: compact ? "compact" : "standard",
  }).format(value);

export const formatDate = (value: string): string =>
  new Intl.DateTimeFormat(getLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const timeInBusiness = (startDate: string): string => {
  const months = Math.max(
    0,
    Math.floor((Date.now() - new Date(startDate).getTime()) / 2_629_746_000),
  );
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  const locale = getLocale();
  if (locale.startsWith("es")) {
    return `${years} ano${years === 1 ? "" : "s"} ${remainingMonths} mes${remainingMonths === 1 ? "" : "es"}`;
  }
  return `${years} yr${years === 1 ? "" : "s"} ${remainingMonths} mo`;
};