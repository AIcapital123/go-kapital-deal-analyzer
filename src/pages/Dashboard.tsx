import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, CheckCircle2, CircleDollarSign, Clock3, FilePlus2, FileText, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type TableColumn } from "@/components/DataTable";
import { EmptyState, PageHeader, SummaryCard } from "@/components/Common";
import { StatusBadge } from "@/components/StatusBadge";
import { dealStorage } from "@/services/dealStorage";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Deal, DealStatus } from "@/types/deal";

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DealStatus | "all">("all");
  const deals = dealStorage.getAll();

  const filteredDeals = useMemo(() => deals.filter((deal) => {
    const matchesSearch = (deal.business.legalName + " " + deal.business.industry).toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "all" || deal.status === status);
  }), [deals, search, status]);

  const columns: TableColumn<Deal>[] = [
    { key: "business", header: t("dashboard.colBusiness"), render: (deal) => <div><div className="font-bold text-[#16365D]">{deal.business.legalName}</div><div className="mt-0.5 text-xs text-[#667085]">{deal.business.dbaName}</div></div> },
    { key: "amount", header: t("dashboard.colAmount"), render: (deal) => <span className="font-semibold">{formatCurrency(deal.business.requestedAmount)}</span> },
    { key: "industry", header: t("dashboard.colIndustry"), render: (deal) => deal.business.industry },
    { key: "documents", header: t("dashboard.colDocuments"), render: (deal) => <span>{deal.documents.length} {deal.documents.length === 1 ? t("common.file") : t("common.files")}</span> },
    { key: "entryMode", header: t("dashboard.colEntryMode"), render: (deal) => deal.entryMode === "automated" ? <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF9EE] px-2.5 py-1 text-xs font-bold text-[#3A9738]">{t("entryMode.automated")}</span> : <span className="rounded-full bg-[#EEF3F8] px-2.5 py-1 text-xs font-bold text-[#16365D]">{t("entryMode.manual")}</span> },
    { key: "status", header: t("dashboard.colStatus"), render: (deal) => <StatusBadge status={deal.status} /> },
    { key: "created", header: t("dashboard.colCreated"), render: (deal) => formatDate(deal.createdAt) },
    { key: "action", header: t("dashboard.colAction"), render: (deal) => <Button variant="ghost" size="sm" className="rounded-lg text-[#16365D] hover:bg-[#EEF9EE] hover:text-[#3A9738]" onClick={(e) => { e.stopPropagation(); navigate("/deals/" + deal.id); }}>{t("common.view")} <ArrowRight className="ml-1 h-4 w-4" /></Button> },
  ];

  const awaiting = deals.filter((deal) => ["ready", "analyzing", "needs_review"].includes(deal.status)).length;
  const completed = deals.filter((deal) => deal.status === "completed").length;

  return (
    <>
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")}
        actions={<Button onClick={() => navigate("/deals/new")} className="h-10 rounded-lg bg-[#4AB547] px-4 font-bold text-white hover:bg-[#3FA33D]"><FilePlus2 className="mr-2 h-4 w-4" />{t("dashboard.newDeal")}</Button>} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <button type="button" onClick={() => navigate("/deals/new")} className="group flex flex-col rounded-xl border border-[#DDE3E8] bg-white p-5 text-left transition-all hover:border-[#4AB547] hover:shadow-md">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]"><FileText className="h-6 w-6" /></div><h3 className="text-lg font-extrabold text-[#16365D]">{t("dashboard.manualTitle")}</h3></div>
          <p className="mt-3 text-sm leading-relaxed text-[#667085]">{t("dashboard.manualDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#16365D] group-hover:text-[#4AB547]">{t("dashboard.manualButton")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </button>
        <button type="button" onClick={() => navigate("/underwriter/new")} className="group flex flex-col rounded-xl border border-[#DDE3E8] bg-white p-5 text-left transition-all hover:border-[#4AB547] hover:shadow-md">
          <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF9EE] text-[#3A9738]"><Sparkles className="h-6 w-6" /></div><h3 className="text-lg font-extrabold text-[#16365D]">{t("dashboard.underwriterTitle")}</h3></div>
          <p className="mt-3 text-sm leading-relaxed text-[#667085]">{t("dashboard.underwriterDesc")}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#16365D] group-hover:text-[#4AB547]">{t("dashboard.underwriterButton")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("dashboard.totalDeals")} value={deals.length} helper={t("dashboard.totalDealsHelper")} icon={CircleDollarSign} tone="navy" />
        <SummaryCard label={t("dashboard.awaiting")} value={awaiting} helper={t("dashboard.awaitingHelper")} icon={Clock3} tone="amber" />
        <SummaryCard label={t("dashboard.completed")} value={completed} helper={t("dashboard.completedHelper")} icon={CheckCircle2} tone="green" />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#DDE3E8] bg-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-extrabold text-[#16365D]">{t("dashboard.recentDeals")}</h2><p className="mt-1 text-xs text-[#667085]">{t("dashboard.recentDealsSubtitle")}</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <label htmlFor="deal-search" className="sr-only">{t("common.search")}</label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" />
              <Input id="deal-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("dashboard.searchPlaceholder")} className="h-10 rounded-lg border-[#DDE3E8] pl-9 focus-visible:ring-[#4AB547]" />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as DealStatus | "all")}>
              <SelectTrigger aria-label={t("dashboard.allStatuses")} className="h-10 rounded-lg border-[#DDE3E8] sm:w-48"><SelectValue placeholder={t("dashboard.allStatuses")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("dashboard.allStatuses")}</SelectItem>
                <SelectItem value="draft">{t("status.draft")}</SelectItem>
                <SelectItem value="ready">{t("status.ready")}</SelectItem>
                <SelectItem value="analyzing">{t("status.analyzing")}</SelectItem>
                <SelectItem value="completed">{t("status.completed")}</SelectItem>
                <SelectItem value="needs_review">{t("status.needs_review")}</SelectItem>
                <SelectItem value="error">{t("status.error")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {deals.length === 0 ? (
          <div className="p-5"><EmptyState title={t("dashboard.noDeals")} message={t("dashboard.noDealsMsg")} action={<Button onClick={() => navigate("/deals/new")} className="rounded-lg bg-[#4AB547] hover:bg-[#3FA33D]">{t("dashboard.createNewDeal")}</Button>} /></div>
        ) : (
          <DataTable columns={columns} rows={filteredDeals} rowKey={(deal) => deal.id} onRowClick={(deal) => navigate("/deals/" + deal.id)} emptyMessage={t("dashboard.noMatch")} />
        )}
      </section>
    </>
  );
};

export default Dashboard;