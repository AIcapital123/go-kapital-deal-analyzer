import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DealStatus | "all">("all");
  const deals = dealStorage.getAll();

  const filteredDeals = useMemo(() => deals.filter((deal) => {
    const matchesSearch = `${deal.business.legalName} ${deal.business.industry}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (status === "all" || deal.status === status);
  }), [deals, search, status]);

  const columns: TableColumn<Deal>[] = [
    { key: "business", header: "Business Name", render: (deal) => <div><div className="font-bold text-[#16365D]">{deal.business.legalName}</div><div className="mt-0.5 text-xs text-[#667085]">{deal.business.dbaName}</div></div> },
    { key: "amount", header: "Requested Amount", render: (deal) => <span className="font-semibold">{formatCurrency(deal.business.requestedAmount)}</span> },
    { key: "industry", header: "Industry", render: (deal) => deal.business.industry },
    { key: "documents", header: "Documents", render: (deal) => <span>{deal.documents.length} file{deal.documents.length === 1 ? "" : "s"}</span> },
    { key: "status", header: "Analysis Status", render: (deal) => <StatusBadge status={deal.status} /> },
    { key: "created", header: "Created Date", render: (deal) => formatDate(deal.createdAt) },
    { key: "action", header: "Action", render: (deal) => <Button variant="ghost" size="sm" className="rounded-lg text-[#16365D] hover:bg-[#EEF9EE] hover:text-[#3A9738]" onClick={(event) => { event.stopPropagation(); navigate(`/deals/${deal.id}`); }}>View <ArrowRight className="ml-1 h-4 w-4" /></Button> },
  ];

  const awaiting = deals.filter((deal) => ["ready", "analyzing", "needs_review"].includes(deal.status)).length;
  const completed = deals.filter((deal) => deal.status === "completed").length;

  return (
    <>
      <PageHeader
        title="Deal Analyzer"
        subtitle="Organize business loan files and review Sample Analysis results."
        actions={<Button onClick={() => navigate("/deals/new")} className="h-10 rounded-lg bg-[#4AB547] px-4 font-bold text-white hover:bg-[#3FA33D]"><FilePlus2 className="mr-2 h-4 w-4" />New Deal</Button>}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => navigate("/deals/new")}
          className="group flex flex-col rounded-xl border border-[#DDE3E8] bg-white p-5 text-left transition-all hover:border-[#4AB547] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF3F8] text-[#16365D]">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#16365D]">Manual Deal Entry</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#667085]">
            Enter the client's business and contact information manually, then optionally upload supporting documents.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#16365D] group-hover:text-[#4AB547]">
            Enter Deal Manually <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => navigate("/underwriter/new")}
          className="group flex flex-col rounded-xl border border-[#DDE3E8] bg-white p-5 text-left transition-all hover:border-[#4AB547] hover:shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF9EE] text-[#3A9738]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-extrabold text-[#16365D]">Automated AI Underwriter</h3>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#667085]">
            Upload the loan application, bank statements, tax returns, and supporting documents to extract the client profile, research the business, and prepare a revenue summary.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#16365D] group-hover:text-[#4AB547]">
            Open AI Underwriter <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Total Deals" value={deals.length} helper="All deals in the current pipeline" icon={CircleDollarSign} tone="navy" />
        <SummaryCard label="Awaiting Sample Analysis" value={awaiting} helper="Ready, loading, or needs review" icon={Clock3} tone="amber" />
        <SummaryCard label="Completed Sample Analyses" value={completed} helper="Sample results completed and available" icon={CheckCircle2} tone="green" />
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-[#DDE3E8] bg-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#16365D]">Recent Deals</h2>
            <p className="mt-1 text-xs text-[#667085]">Review current submissions and analysis status.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <label htmlFor="deal-search" className="sr-only">Search deals</label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" />
              <Input id="deal-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business or industry" className="h-10 rounded-lg border-[#DDE3E8] pl-9 focus-visible:ring-[#4AB547]" />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as DealStatus | "all")}>
              <SelectTrigger aria-label="Filter by status" className="h-10 rounded-lg border-[#DDE3E8] sm:w-48"><SelectValue placeholder="All statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready">Ready for Sample Analysis</SelectItem>
                <SelectItem value="analyzing">Loading Sample</SelectItem>
                <SelectItem value="completed">Sample Complete</SelectItem>
                <SelectItem value="needs_review">Needs Review</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>

            </Select>
          </div>
        </div>
        {deals.length === 0 ? (
          <div className="p-5"><EmptyState title="No deals yet" message="Create your first deal to begin organizing business and document information." action={<Button onClick={() => navigate("/deals/new")} className="rounded-lg bg-[#4AB547] hover:bg-[#3FA33D]">Create New Deal</Button>} /></div>
        ) : (
          <DataTable columns={columns} rows={filteredDeals} rowKey={(deal) => deal.id} onRowClick={(deal) => navigate(`/deals/${deal.id}`)} emptyMessage="No deals match the selected filters." />
        )}
      </section>
    </>
  );
};

export default Dashboard;
