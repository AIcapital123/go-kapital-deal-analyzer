import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DealStatus } from "@/types/deal";

const statusStyles: Record<DealStatus, string> = {
  draft: "border-slate-200 bg-slate-100 text-slate-700",
  ready: "border-blue-200 bg-blue-50 text-blue-700",
  analyzing: "border-amber-200 bg-amber-50 text-amber-800",
  completed: "border-green-200 bg-green-50 text-green-700",
  needs_review: "border-orange-200 bg-orange-50 text-orange-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

export const StatusBadge = ({ status }: { status: DealStatus }) => {
  const { t } = useTranslation();
  return (
    <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-bold", statusStyles[status])}>
      {status === "analyzing" && <span className="mr-1.5 mt-0.5 h-2 w-2 animate-pulse rounded-full bg-amber-500" />}
      {t("status." + status)}
    </span>
  );
};