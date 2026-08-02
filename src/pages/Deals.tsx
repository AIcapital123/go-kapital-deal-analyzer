import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, FilePlus2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, type TableColumn } from "@/components/DataTable";
import { EmptyState, PageHeader } from "@/components/Common";
import { StatusBadge } from "@/components/StatusBadge";
import { dealStorage } from "@/services/dealStorage";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Deal, DealStatus } from "@/types/deal";

const Deals = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<DealStatus | "all">("all");
  const deals = dealStorage.getAll();

  const filteredDeals = useMemo(() => deals.filter((deal) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = `${deal.business.legalName} ${deal.business.dbaName} ${deal.business.industry}`.toLowerCase().includes(query);
    return matchesSearch && (status === "all" || deal.status === status);
  }), [deals, search, status]);

  const columns: TableColumn<Deal>[] = [
    { key: "business", header: "Business Name", render: (deal) => <div><div className="font-bold text-[#16365D]">{deal.business.legalName}</div><div className="mt-0.5 text-xs text-[#667085]">{deal.business.dbaName || "No DBA"}</div></div> },
    { key: "amount", header: "Requested Amount", render: (deal) => <span className="font-semibold">{formatCurrency(deal.business.requestedAmount)}</span> },
    { key: "industry", header: "Industry", render: (deal) => deal.business.industry },
    { key: "documents", header: "Documents", render: (deal) => <span>{deal.documents.length} file{deal.documents.length === 1 ? "" : "s"}</span> },
    { key: "entryMode", header: "Entry Mode", render: (deal) => deal.entryMode === "automated" ? <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF9EE] px-2.5 py-1 text-xs font-bold text-[#3A9738]">AI Underwriter</span> : <span className="rounded-full bg-[#EEF3F8] px-2.5 py-1 text-xs font-bold text-[#16365D]">Manual</span> },
    { key: "status", header: "Analysis Status", render: (deal) => <StatusBadge status={deal.status} /> },
    { key: "created", header: "Created Date", render: (deal) => formatDate(deal.createdAt) },
    { key: "action", header: "Action", render: (deal) => <Button variant="ghost" size="sm" className="rounded-lg text-[#16365D] hover:bg-[#EEF9EE] hover:text-[#3A9738]" onClick={(event) => { event.stopPropagation(); navigate(`/deals/${deal.id}`); }}>View <ArrowRight className="ml-1 h-4 w-4" /></Button> },
  ];

  return (
    <>
      <PageHeader
        title="Deals"
        subtitle="Search and review every deal in the current pipeline."
        actions={<Button onClick={() => navigate("/deals/new")} className="h-10 rounded-lg bg-[#4AB547] px-4 font-bold text-white hover:bg-[#3FA33D]"><FilePlus2 className="mr-2 h-4 w-4" />New Deal</Button>}
      />

      <section className="overflow-hidden rounded-xl border border-[#DDE3E8] bg-white">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-extrabold text-[#16365D]">All Deals</h2><p className="mt-1 text-xs text-[#667085]">{filteredDeals.length} of {deals.length} deals shown</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-72">
              <label htmlFor="all-deal-search" className="sr-only">Search all deals</label>
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#98A2B3]" />
              <Input id="all-deal-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business or industry" className="h-10 rounded-lg border-[#DDE3E8] pl-9 focus-visible:ring-[#4AB547]" />
            </div>
            <Select value={status} onValueChange={(value) => setStatus(value as DealStatus | "all")}>
              <SelectTrigger aria-label="Filter deals by status" className="h-10 rounded-lg border-[#DDE3E8] sm:w-48"><SelectValue /></SelectTrigger>
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
        {deals.length ? <DataTable columns={columns} rows={filteredDeals} rowKey={(deal) => deal.id} onRowClick={(deal) => navigate(`/deals/${deal.id}`)} emptyMessage="No deals match the selected filters." /> : <div className="p-5"><EmptyState title="No deals yet" message="Create a deal to begin building the pipeline." action={<Button onClick={() => navigate("/deals/new")} className="rounded-lg bg-[#4AB547] hover:bg-[#3FA33D]">Create New Deal</Button>} /></div>}
      </section>
    </>
  );
};

export default Deals;
