import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Download, Edit3, FileCheck2, FileSearch, FileText, Mail, MapPin, MoreHorizontal, Pencil, Phone, RefreshCw, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AnalysisSection, EmptyState, ErrorMessage, PageHeader, SummaryCard } from "@/components/Common";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DataTable, type TableColumn } from "@/components/DataTable";
import { RiskFlagCard } from "@/components/RiskFlagCard";
import { StatusBadge } from "@/components/StatusBadge";
import { analyzeDeal } from "@/services/analysisService";
import { dealStorage } from "@/services/dealStorage";
import { formatCurrency, formatDate, formatFileSize, timeInBusiness } from "@/lib/format";
import type { BankStatementMonth, Deal, Document, ExistingLoan, RecentFundingActivity, TaxReturnSummary } from "@/types/deal";

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-b border-[#EEF1F3] py-3 last:border-0 sm:py-4">
    <dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{label}</dt>
    <dd className="mt-1 text-sm font-bold text-[#16365D]">{value || "—"}</dd>
  </div>
);

const DealDetails = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [deal, setDeal] = useState<Deal | undefined>(() => dealStorage.getById(id));
  const [note, setNote] = useState(deal?.analystNote?.content ?? "");
  const [running, setRunning] = useState(false);
  const [deleteDocumentId, setDeleteDocumentId] = useState<string | null>(null);
  const activeTab = searchParams.get("tab") || "overview";

  const runAnalysis = async () => {
    if (!deal) return;
    setRunning(true);
    const analyzingDeal = { ...deal, status: "analyzing" as const };
    setDeal(analyzingDeal);
    dealStorage.updateStatus(deal.id, "analyzing");
    try {
      const analysis = await analyzeDeal(analyzingDeal);
      const status = analysis.riskFlags.some((flag) => flag.severity === "High") ? "needs_review" : "completed";
      const updated = dealStorage.update(deal.id, { analysis, status });
      setDeal(updated);
      setSearchParams({ tab: "analysis" });
      toast.success("Prototype analysis refreshed");
    } catch {
      const updated = dealStorage.updateStatus(deal.id, "error");
      setDeal(updated);
      toast.error("Analysis could not be completed");
    } finally {
      setRunning(false);
    }
  };

  const saveNote = () => {
    if (!deal) return;
    setDeal(dealStorage.saveNote(deal.id, note));
    toast.success("Analyst note saved locally");
  };

  const removeDocument = () => {
    if (!deal || !deleteDocumentId) return;
    const updated = dealStorage.update(deal.id, { documents: deal.documents.filter((document) => document.id !== deleteDocumentId) });
    setDeal(updated);
    toast.success("Document metadata removed");
  };

  if (!deal) {
    return (
      <>
        <PageHeader title="Deal Not Found" subtitle="The requested deal is not available in this browser." />
        <ErrorMessage message="This prototype stores deals only in local browser storage. The deal may have been removed or created in another browser." />
        <Button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-[#16365D] hover:bg-[#102B4B]"><ArrowLeft className="mr-2 h-4 w-4" />Return to Dashboard</Button>
      </>
    );
  }

  const documentColumns: TableColumn<Document>[] = [
    { key: "name", header: "Document Name", render: (document) => <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#667085]" /><span className="font-bold text-[#16365D]">{document.name}</span></div> },
    { key: "category", header: "Category", render: (document) => document.category },
    { key: "period", header: "Period", render: (document) => document.period || "—" },
    { key: "size", header: "File Size", render: (document) => formatFileSize(document.size) },
    { key: "date", header: "Upload Date", render: (document) => formatDate(document.uploadDate) },
    { key: "status", header: "Processing Status", render: (document) => <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${document.processingStatus === "processed" ? "bg-green-50 text-green-700" : document.processingStatus === "needs_review" ? "bg-amber-50 text-amber-800" : "bg-slate-100 text-slate-700"}`}>{document.processingStatus === "processed" ? "Processed" : document.processingStatus === "needs_review" ? "Needs Review" : "Pending"}</span> },
    { key: "actions", header: "Actions", className: "min-w-[280px]", render: (document) => <div className="flex gap-1"><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info("Preview will be available when document storage is connected.")}><FileSearch className="mr-1 h-3.5 w-3.5" />Preview</Button><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info("Download will be available when document storage is connected.")}><Download className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info("Replace will be available when document storage is connected.")}><Upload className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteDocumentId(document.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];

  const analysis = deal.analysis;
  const bankColumns: TableColumn<BankStatementMonth>[] = [
    { key: "month", header: "Month", render: (row) => <span className="font-bold text-[#16365D]">{row.month}</span> },
    { key: "deposits", header: "Total Deposits", render: (row) => formatCurrency(row.totalDeposits) },
    { key: "adb", header: "Average Daily Balance", render: (row) => formatCurrency(row.averageDailyBalance) },
    { key: "count", header: "Number of Deposits", render: (row) => row.numberOfDeposits },
    { key: "negative", header: "Negative Balance Days", render: (row) => <span className={row.negativeBalanceDays ? "font-bold text-amber-700" : "text-green-700"}>{row.negativeBalanceDays}</span> },
    { key: "ending", header: "Ending Balance", render: (row) => formatCurrency(row.endingBalance) },
    { key: "nsf", header: "NSF / Overdraft", render: (row) => <span className={row.nsfCount ? "font-bold text-red-700" : "text-green-700"}>{row.nsfCount}</span> },
  ];
  const loanColumns: TableColumn<ExistingLoan>[] = [
    { key: "lender", header: "Funder or Lender", render: (row) => <span className="font-bold text-[#16365D]">{row.lender}</span> },
    { key: "account", header: "Account / ACH Name", render: (row) => row.accountName },
    { key: "date", header: "Funding Date", render: (row) => formatDate(row.fundingDate) },
    { key: "original", header: "Original Funding Amount", render: (row) => formatCurrency(row.originalAmount) },
    { key: "debit", header: "Observed Debit", render: (row) => formatCurrency(row.observedDebit) },
    { key: "frequency", header: "Repayment Frequency", render: (row) => row.frequency },
    { key: "monthly", header: "Estimated Monthly Payment", render: (row) => formatCurrency(row.estimatedMonthlyPayment) },
    { key: "status", header: "Position Status", render: (row) => <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{row.status}</span> },
  ];
  const recentColumns: TableColumn<RecentFundingActivity>[] = [
    { key: "funder", header: "Funder", render: (row) => <span className="font-bold text-[#16365D]">{row.funder}</span> },
    { key: "deposit", header: "Deposit Date and Amount", render: (row) => <span>{row.depositDate} · <strong>{formatCurrency(row.depositAmount)}</strong></span> },
    { key: "debit", header: "Observed Debit", render: (row) => formatCurrency(row.observedDebit) },
    { key: "frequency", header: "Frequency", render: (row) => row.frequency },
    { key: "source", header: "Source Document", render: (row) => row.sourceDocument },
  ];
  const taxColumns: TableColumn<TaxReturnSummary>[] = [
    { key: "year", header: "Tax Year", render: (row) => <span className="font-bold text-[#16365D]">{row.taxYear}</span> },
    { key: "revenue", header: "Gross Revenue", render: (row) => formatCurrency(row.grossRevenue) },
    { key: "cogs", header: "Cost of Goods Sold", render: (row) => formatCurrency(row.costOfGoodsSold) },
    { key: "profit", header: "Gross Profit", render: (row) => formatCurrency(row.grossProfit) },
    { key: "income", header: "Net Income", render: (row) => formatCurrency(row.netIncome) },
    { key: "assets", header: "Total Assets", render: (row) => formatCurrency(row.totalAssets) },
    { key: "liabilities", header: "Total Liabilities", render: (row) => formatCurrency(row.totalLiabilities) },
  ];

  const averages = (() => {
    if (!analysis?.bankStatements.length) return { deposits: 0, balance: 0, negative: 0, trend: "—" };
    const months = analysis.bankStatements;
    return {
      deposits: months.reduce((sum, month) => sum + month.totalDeposits, 0) / months.length,
      balance: months.reduce((sum, month) => sum + month.averageDailyBalance, 0) / months.length,
      negative: months.reduce((sum, month) => sum + month.negativeBalanceDays, 0),
      trend: "Declining 11.8%",
    };
  })();

  const NoteEditor = () => (
    <div>
      <label htmlFor="analyst-note" className="mb-2 block text-sm font-bold text-[#344054]">Broker and analyst notes</label>
      <Textarea id="analyst-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Enter deal context, follow-up requests, or underwriting observations…" className="min-h-36 rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" />
      <div className="mt-3 flex justify-end"><Button onClick={saveNote} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]"><Save className="mr-2 h-4 w-4" />Save Notes</Button></div>
    </div>
  );

  return (
    <>
      <button onClick={() => navigate("/")} className="mb-4 inline-flex items-center text-sm font-bold text-[#667085] hover:text-[#16365D]"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to Dashboard</button>
      <PageHeader
        title={deal.business.legalName}
        subtitle={`${formatCurrency(deal.business.requestedAmount)} requested • Created ${formatDate(deal.createdAt)}`}
        actions={<><StatusBadge status={deal.status} /><Button variant="outline" onClick={runAnalysis} disabled={running} className="rounded-lg border-[#BFC9D2] font-bold text-[#16365D]">{running ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{running ? "Analyzing…" : "Analyze Again"}</Button><Button onClick={() => toast.info("Deal editing will be enabled with the connected deal database.")} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]"><Edit3 className="mr-2 h-4 w-4" />Edit Deal</Button></>}
      />

      <Tabs value={activeTab} onValueChange={(value) => setSearchParams(value === "overview" ? {} : { tab: value })}>
        <div className="mb-5 overflow-x-auto border-b border-[#DDE3E8]"><TabsList className="h-auto min-w-max justify-start rounded-none bg-transparent p-0">{["overview", "documents", "analysis", "notes"].map((tab) => <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent px-5 py-3 font-bold capitalize text-[#667085] shadow-none data-[state=active]:border-[#4AB547] data-[state=active]:bg-transparent data-[state=active]:text-[#16365D] data-[state=active]:shadow-none">{tab}</TabsTrigger>)}</TabsList></div>

        <TabsContent value="overview" className="mt-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><div className="flex items-center gap-2"><BuildingIcon /><h2 className="font-extrabold text-[#16365D]">Business Information</h2></div><dl className="mt-3 grid gap-x-8 sm:grid-cols-2"><DetailItem label="Legal Business Name" value={deal.business.legalName} /><DetailItem label="DBA" value={deal.business.dbaName} /><DetailItem label="Industry" value={deal.business.industry} /><DetailItem label="Time in Business" value={deal.business.startDate ? timeInBusiness(deal.business.startDate) : "Not provided"} /><DetailItem label="State" value={<span className="inline-flex items-center"><MapPin className="mr-1 h-3.5 w-3.5" />{deal.business.state}</span>} /><DetailItem label="Requested Amount" value={formatCurrency(deal.business.requestedAmount)} /></dl></section>
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><div className="flex items-center gap-2"><ContactIcon /><h2 className="font-extrabold text-[#16365D]">Primary Contact</h2></div><dl className="mt-3"><DetailItem label="Contact" value={deal.business.contact.name} /><DetailItem label="Email" value={<span className="inline-flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5" />{deal.business.contact.email}</span>} /><DetailItem label="Phone" value={<span className="inline-flex items-center"><Phone className="mr-1.5 h-3.5 w-3.5" />{deal.business.contact.phone || "Not provided"}</span>} /></dl></section>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><FileCheck2 className="h-5 w-5 text-[#4AB547]" /><h2 className="mt-3 font-extrabold text-[#16365D]">Document Completeness</h2><p className="mt-2 text-3xl font-extrabold text-[#16365D]">{Math.min(100, Math.round((deal.documents.length / 6) * 100))}%</p><p className="mt-1 text-xs text-[#667085]">{deal.documents.length} documents currently in the deal file</p></section>
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><CheckCircle2 className="h-5 w-5 text-[#4AB547]" /><h2 className="mt-3 font-extrabold text-[#16365D]">Analysis Status</h2><div className="mt-3"><StatusBadge status={deal.status} /></div><p className="mt-3 text-xs text-[#667085]">{analysis ? `Last generated ${formatDate(analysis.generatedAt)}` : "No analysis has been generated"}</p></section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><AlertTriangle className="h-5 w-5 text-amber-700" /><h2 className="mt-3 font-extrabold text-amber-900">Important Warnings</h2><p className="mt-2 text-3xl font-extrabold text-amber-900">{analysis?.riskFlags.length ?? 0}</p><p className="mt-1 text-xs text-amber-800">{analysis ? "Risk flags require broker review" : "Run analysis to screen for risk flags"}</p></section>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="mt-0">
          <section className="overflow-hidden rounded-xl border border-[#DDE3E8] bg-white"><div className="flex items-center justify-between p-5"><div><h2 className="font-extrabold text-[#16365D]">Deal Documents</h2><p className="mt-1 text-xs text-[#667085]">File metadata only in this prototype.</p></div><Button variant="outline" onClick={() => toast.info("Additional uploads will be enabled with document storage.")} className="rounded-lg border-[#BFC9D2]"><Upload className="mr-2 h-4 w-4" />Add Documents</Button></div>{deal.documents.length ? <DataTable columns={documentColumns} rows={deal.documents} rowKey={(document) => document.id} /> : <div className="p-5"><EmptyState title="No documents in this deal" message="Document metadata will appear here after files are added." /></div>}</section>
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          {!analysis ? (
            <EmptyState title="No analysis available" message="Run the prototype analysis to generate a structured deal summary using realistic mock results." action={<Button onClick={runAnalysis} disabled={running} className="rounded-lg bg-[#4AB547] font-bold hover:bg-[#3FA33D]"><Sparkles className="mr-2 h-4 w-4" />{running ? "Analyzing…" : "Analyze Deal"}</Button>} />
          ) : (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-[#F0FAF0] p-4 text-sm text-[#286C2A] sm:flex-row sm:items-center sm:justify-between"><div><strong>Prototype analysis data</strong><span className="ml-2 text-[#417E43]">Generated {formatDate(analysis.generatedAt)}. Results are simulated and require manual review.</span></div><Button disabled variant="outline" className="rounded-lg border-green-300 bg-white text-[#286C2A]"><Download className="mr-2 h-4 w-4" />Export Summary · Coming later</Button></div>

              <AnalysisSection title="1. Executive Deal Summary" description="Consolidated business profile and initial underwriting observations">
                <p className="rounded-lg bg-[#F8FAFB] p-4 text-sm leading-relaxed text-[#344054]">{analysis.summary}</p>
                <dl className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4"><DetailItem label="Business Name" value={deal.business.legalName} /><DetailItem label="Industry" value={deal.business.industry} /><DetailItem label="Time in Business" value={deal.business.startDate ? timeInBusiness(deal.business.startDate) : "Not provided"} /><DetailItem label="Location" value={deal.business.state} /><DetailItem label="Requested Loan Amount" value={formatCurrency(deal.business.requestedAmount)} /><DetailItem label="Estimated Monthly Revenue" value={formatCurrency(analysis.estimatedMonthlyRevenue)} /><DetailItem label="Existing Financing Positions" value={analysis.existingFinancingPositions} /><DetailItem label="Important Risk Flags" value={`${analysis.riskFlags.length} identified`} /></dl>
                <div className="mt-4 rounded-lg border-l-4 border-[#4AB547] bg-[#F0FAF0] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#3A9738]">Overall cash-flow observation</p><p className="mt-1 text-sm leading-relaxed text-[#344054]">{analysis.cashFlowObservation}</p></div>
              </AnalysisSection>

              <AnalysisSection title="2. Bank Statement Summary" description="Statements shown in descending chronological order"><DataTable columns={bankColumns} rows={analysis.bankStatements} rowKey={(row) => row.month} /><div className="mt-5 grid gap-4 md:grid-cols-4"><SummaryCard label="Average Monthly Deposits" value={formatCurrency(averages.deposits)} helper="Across all reviewed months" icon={FileCheck2} tone="green" /><SummaryCard label="Average Daily Balance" value={formatCurrency(averages.balance)} helper="Average of monthly ADB" icon={CalendarDays} tone="navy" /><SummaryCard label="Total Negative Days" value={averages.negative} helper="Across all reviewed months" icon={AlertTriangle} tone="amber" /><SummaryCard label="Deposit Trend" value={averages.trend} helper="February through May" icon={MoreHorizontal} tone="amber" /></div></AnalysisSection>
              <AnalysisSection title="3. Existing MCA and Loan Positions" description="Observed recurring obligations requiring verification"><DataTable columns={loanColumns} rows={analysis.existingLoans} rowKey={(row) => row.lender} /></AnalysisSection>
              <AnalysisSection title="4. Recent Funding and Debit Activity" description="Potential financing deposits matched to recurring debits"><DataTable columns={recentColumns} rows={analysis.recentFunding} rowKey={(row) => row.funder} /></AnalysisSection>
              <AnalysisSection title="5. Tax Return Summary" description="Reported results by tax year"><DataTable columns={taxColumns} rows={analysis.taxReturns} rowKey={(row) => String(row.taxYear)} /><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-lg border border-green-200 bg-green-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-green-700">Year-over-year revenue change</p><p className="mt-1 text-2xl font-extrabold text-green-800">+{analysis.revenueChange}%</p></div><div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#667085]">Tax return / bank comparison</p><p className="mt-1 text-sm leading-relaxed text-[#344054]">{analysis.taxBankInconsistency}</p></div></div></AnalysisSection>
              <AnalysisSection title="6. Risk Flags" description={`${analysis.riskFlags.length} items identified for manual review`}><div className="space-y-3">{analysis.riskFlags.map((flag) => <RiskFlagCard key={flag.id} flag={flag} />)}</div></AnalysisSection>
              <AnalysisSection title="7. Analyst Notes" description="Saved locally to this prototype deal"><NoteEditor /></AnalysisSection>
            </div>
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-0"><AnalysisSection title="Deal Notes" description="Document broker follow-up and underwriting context"><NoteEditor /></AnalysisSection></TabsContent>
      </Tabs>

      <ConfirmationDialog open={Boolean(deleteDocumentId)} onOpenChange={(open) => !open && setDeleteDocumentId(null)} title="Remove document metadata?" description="This removes the document record from the prototype deal. No actual file content is stored." confirmLabel="Remove Document" onConfirm={removeDocument} />
    </>
  );
};

const BuildingIcon = () => <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F8]"><Pencil className="h-4 w-4 text-[#16365D]" /></span>;
const ContactIcon = () => <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F8]"><Mail className="h-4 w-4 text-[#16365D]" /></span>;

export default DealDetails;
