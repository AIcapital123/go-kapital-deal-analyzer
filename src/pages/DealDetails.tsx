import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ArrowLeft, CalendarDays, CheckCircle2, Download, Edit3, FileCheck2, FileSearch, FileText, Mail, MapPin, MoreHorizontal, Pencil, Phone, RefreshCw, Save, Sparkles, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisSection, EmptyState, ErrorMessage, PageHeader, SummaryCard } from "@/components/Common";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { DataTable, type TableColumn } from "@/components/DataTable";
import { RiskFlagCard } from "@/components/RiskFlagCard";
import { SourceEvidenceList } from "@/components/SourceEvidenceList";
import { StatusBadge } from "@/components/StatusBadge";
import { analyzeDeal } from "@/services/analysisService";
import { dealStorage } from "@/services/dealStorage";
import { formatCurrency, formatDate, formatFileSize, timeInBusiness } from "@/lib/format";
import type { BankStatementMonth, Deal, Document, ExistingLoan, RecentFundingActivity, TaxReturnSummary } from "@/types/deal";

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-b border-[#EEF1F3] py-3 last:border-0 sm:py-4"><dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{label}</dt><dd className="mt-1 text-sm font-bold text-[#16365D]">{value || "—"}</dd></div>
);

const DealDetails = () => {
  const { t } = useTranslation();
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
    setRunning(true); const ad = { ...deal, status: "analyzing" as const }; setDeal(ad); dealStorage.updateStatus(deal.id, "analyzing");
    try { const analysis = await analyzeDeal(ad); const status = analysis.riskFlags.some((f) => f.severity === "High") ? "needs_review" : "completed"; const updated = dealStorage.update(deal.id, { analysis, status }); setDeal(updated); setSearchParams({ tab: "analysis" }); toast.success(t("dealDetails.analysisRefreshed")); }
    catch { const updated = dealStorage.updateStatus(deal.id, "error"); setDeal(updated); toast.error(t("dealDetails.analysisFailed")); }
    finally { setRunning(false); }
  };

  const saveNote = () => { if (!deal) return; setDeal(dealStorage.saveNote(deal.id, note)); toast.success(t("dealDetails.noteSaved")); };
  const removeDocument = () => { if (!deal || !deleteDocumentId) return; const updated = dealStorage.update(deal.id, { documents: deal.documents.filter((d) => d.id !== deleteDocumentId) }); setDeal(updated); toast.success(t("dealDetails.docRemoved")); };

  if (!deal) { return (<>
    <PageHeader title={t("dealDetails.notFound")} subtitle={t("dealDetails.notFoundMsg")} />
    <ErrorMessage message={t("dealDetails.notFoundDesc")} />
    <Button onClick={() => navigate("/")} className="mt-4 rounded-lg bg-[#16365D] hover:bg-[#102B4B]"><ArrowLeft className="mr-2 h-4 w-4" />{t("dealDetails.returnDashboard")}</Button>
  </>); }

  const analysis = deal.analysis;
  const documentColumns: TableColumn<Document>[] = [
    { key: "name", header: t("dealDetails.colDocName"), render: (d) => <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#667085]" /><span className="font-bold text-[#16365D]">{d.name}</span></div> },
    { key: "category", header: t("dealDetails.colCategory"), render: (d) => d.category },
    { key: "period", header: t("dealDetails.colPeriod"), render: (d) => d.period || "—" },
    { key: "size", header: t("dealDetails.colSize"), render: (d) => formatFileSize(d.size) },
    { key: "date", header: t("dealDetails.colUploadDate"), render: (d) => formatDate(d.uploadDate) },
    { key: "status", header: t("dealDetails.colProcessingStatus"), render: (d) => <span className={"rounded-full px-2.5 py-1 text-xs font-bold capitalize " + (d.processingStatus === "processed" ? "bg-green-50 text-green-700" : d.processingStatus === "needs_review" || d.processingStatus === "failed" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-700")}>{d.processingStatus.replace("_", " ")}</span> },
    { key: "actions", header: t("dealDetails.colActions"), className: "min-w-[280px]", render: (d) => <div className="flex gap-1"><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info(t("dealDetails.previewMsg"))}><FileSearch className="mr-1 h-3.5 w-3.5" />{t("dealDetails.preview")}</Button><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info(t("dealDetails.downloadMsg"))}><Download className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="rounded-lg" onClick={() => toast.info(t("dealDetails.replaceMsg"))}><Upload className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" className="rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteDocumentId(d.id)}><Trash2 className="h-3.5 w-3.5" /></Button></div> },
  ];
  const bankColumns: TableColumn<BankStatementMonth>[] = [
    { key: "month", header: t("dealDetails.colMonth"), render: (r) => <span className="font-bold text-[#16365D]">{r.month}</span> },
    { key: "gross", header: t("dealDetails.colGross"), render: (r) => formatCurrency(r.grossDeposits) },
    { key: "transfers", header: t("dealDetails.colTransfers"), render: (r) => formatCurrency(r.transfersExcluded) },
    { key: "loan", header: t("dealDetails.colLoanMca"), render: (r) => formatCurrency(r.loanOrMcaProceedsExcluded) },
    { key: "returns", header: t("dealDetails.colReturns"), render: (r) => formatCurrency(r.returnedDepositsExcluded) },
    { key: "other", header: t("dealDetails.colOther"), render: (r) => formatCurrency(r.otherExclusions) },
    { key: "adjusted", header: t("dealDetails.colAdjusted"), render: (r) => <span className="font-extrabold text-[#3A9738]">{formatCurrency(r.adjustedBusinessRevenue)}</span> },
    { key: "adb", header: t("dealDetails.colAdb"), render: (r) => formatCurrency(r.averageDailyBalance) },
    { key: "beginning", header: t("dealDetails.colBeginning"), render: (r) => formatCurrency(r.beginningBalance) },
    { key: "ending", header: t("dealDetails.colEnding"), render: (r) => formatCurrency(r.endingBalance) },
    { key: "count", header: t("dealDetails.colDeposits"), render: (r) => r.numberOfDeposits },
    { key: "negative", header: t("dealDetails.colNegative"), render: (r) => <span className={r.negativeBalanceDays ? "font-bold text-amber-700" : "text-green-700"}>{r.negativeBalanceDays}</span> },
    { key: "nsf", header: t("dealDetails.colNsf"), render: (r) => <span className={r.nsfCount ? "font-bold text-red-700" : "text-green-700"}>{r.nsfCount}</span> },
    { key: "review", header: t("dealDetails.colExclusions"), render: () => <Button disabled variant="outline" size="sm" className="rounded-lg whitespace-nowrap">{t("dealDetails.reviewExclusions")}</Button> },
  ];
  const loanColumns: TableColumn<ExistingLoan>[] = [
    { key: "lender", header: t("dealDetails.colLender"), render: (r) => <span className="font-bold text-[#16365D]">{r.lender}</span> },
    { key: "account", header: t("dealDetails.colAccount"), render: (r) => r.accountName },
    { key: "date", header: t("dealDetails.colFundingDate"), render: (r) => formatDate(r.fundingDate) },
    { key: "original", header: t("dealDetails.colOriginal"), render: (r) => formatCurrency(r.originalAmount) },
    { key: "debit", header: t("dealDetails.colDebit"), render: (r) => formatCurrency(r.observedDebit) },
    { key: "frequency", header: t("dealDetails.colFrequency"), render: (r) => r.frequency },
    { key: "monthly", header: t("dealDetails.colMonthly"), render: (r) => formatCurrency(r.estimatedMonthlyPayment) },
    { key: "status", header: t("dealDetails.colPositionStatus"), render: (r) => <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{r.status}</span> },
    { key: "evidence", header: t("dealDetails.colEvidence"), className: "min-w-[180px]", render: (r) => <SourceEvidenceList evidence={r.sourceEvidence} compact /> },
  ];
  const recentColumns: TableColumn<RecentFundingActivity>[] = [
    { key: "funder", header: t("dealDetails.colFunder"), render: (r) => <span className="font-bold text-[#16365D]">{r.funder}</span> },
    { key: "deposit", header: t("dealDetails.colDepositDate"), render: (r) => <span>{r.depositDate} · <strong>{formatCurrency(r.depositAmount)}</strong></span> },
    { key: "debit", header: t("dealDetails.colDebit"), render: (r) => formatCurrency(r.observedDebit) },
    { key: "frequency", header: t("dealDetails.colFrequency"), render: (r) => r.frequency },
    { key: "source", header: t("dealDetails.colSourceDoc"), render: (r) => r.sourceDocument },
  ];
  const taxColumns: TableColumn<TaxReturnSummary>[] = [
    { key: "year", header: t("dealDetails.colTaxYear"), render: (r) => <span className="font-bold text-[#16365D]">{r.taxYear}</span> },
    { key: "revenue", header: t("dealDetails.colGrossRev"), render: (r) => formatCurrency(r.grossRevenue) },
    { key: "cogs", header: t("dealDetails.colCogs"), render: (r) => formatCurrency(r.costOfGoodsSold) },
    { key: "profit", header: t("dealDetails.colGrossProfit"), render: (r) => formatCurrency(r.grossProfit) },
    { key: "income", header: t("dealDetails.colNetIncome"), render: (r) => formatCurrency(r.netIncome) },
    { key: "assets", header: t("dealDetails.colAssets"), render: (r) => formatCurrency(r.totalAssets) },
    { key: "liabilities", header: t("dealDetails.colLiabilities"), render: (r) => formatCurrency(r.totalLiabilities) },
    { key: "evidence", header: t("dealDetails.colEvidence"), className: "min-w-[180px]", render: (r) => <SourceEvidenceList evidence={r.sourceEvidence} compact /> },
  ];
  const averages = (() => { if (!analysis?.bankStatements.length) return { adjusted: 0, gross: 0, balance: 0, negative: 0, trend: "—" }; const months = analysis.bankStatements; return { adjusted: months.reduce((s, m) => s + m.adjustedBusinessRevenue, 0) / months.length, gross: months.reduce((s, m) => s + m.grossDeposits, 0) / months.length, balance: months.reduce((s, m) => s + m.averageDailyBalance, 0) / months.length, negative: months.reduce((s, m) => s + m.negativeBalanceDays, 0), trend: "-11.9%" }; })();
  const NoteEditor = () => (<div><label htmlFor="analyst-note" className="mb-2 block text-sm font-bold text-[#344054]">{t("dealDetails.brokerNotes")}</label><Textarea id="analyst-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("dealDetails.notesPlaceholder")} className="min-h-36 rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /><div className="mt-3 flex justify-end"><Button onClick={saveNote} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]"><Save className="mr-2 h-4 w-4" />{t("dealDetails.saveNotes")}</Button></div></div>);

  return (
    <>
      <button onClick={() => navigate("/")} className="mb-4 inline-flex items-center text-sm font-bold text-[#667085] hover:text-[#16365D]"><ArrowLeft className="mr-1.5 h-4 w-4" />{t("common.backToDashboard")}</button>
      <PageHeader title={deal.business.legalName} subtitle={formatCurrency(deal.business.requestedAmount) + " " + t("dealDetails.requested") + " • " + t("dealDetails.created") + " " + formatDate(deal.createdAt)}
        actions={<><StatusBadge status={deal.status} />{deal.entryMode === "automated" && <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF9EE] px-3 py-1 text-xs font-bold text-[#3A9738]"><Sparkles className="h-3.5 w-3.5" />{t("entryMode.automated")}</span>}<Button variant="outline" onClick={runAnalysis} disabled={running} className="rounded-lg border-[#BFC9D2] font-bold text-[#16365D]">{running ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{running ? t("dealDetails.loadingSample") : t("dealDetails.runAgain")}</Button><Button onClick={() => toast.info(t("dealDetails.editDealMsg"))} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]"><Edit3 className="mr-2 h-4 w-4" />{t("dealDetails.editDeal")}</Button></>} />
      <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">{t("dealDetails.sampleMode")}</div>
      <Tabs value={activeTab} onValueChange={(v) => setSearchParams(v === "overview" ? {} : { tab: v })}>
        <div className="mb-5 overflow-x-auto border-b border-[#DDE3E8]"><TabsList className="h-auto min-w-max justify-start rounded-none bg-transparent p-0">{["overview", "documents", "analysis", "notes"].map((tab) => <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent px-5 py-3 font-bold capitalize text-[#667085] shadow-none data-[state=active]:border-[#4AB547] data-[state=active]:bg-transparent data-[state=active]:text-[#16365D] data-[state=active]:shadow-none">{t("dealDetails.tab" + tab.charAt(0).toUpperCase() + tab.slice(1))}</TabsTrigger>)}</TabsList></div>
        <TabsContent value="overview" className="mt-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><div className="flex items-center gap-2"><BuildingIcon /><h2 className="font-extrabold text-[#16365D]">{t("dealDetails.businessInfo")}</h2></div><dl className="mt-3 grid gap-x-8 sm:grid-cols-2"><DetailItem label={t("dealDetails.legalName")} value={deal.business.legalName} /><DetailItem label={t("dealDetails.dba")} value={deal.business.dbaName} /><DetailItem label={t("dealDetails.industry")} value={deal.business.industry} /><DetailItem label={t("dealDetails.timeInBusiness")} value={deal.business.startDate ? timeInBusiness(deal.business.startDate) : t("common.notProvided")} /><DetailItem label={t("dealDetails.state")} value={<span className="inline-flex items-center"><MapPin className="mr-1 h-3.5 w-3.5" />{deal.business.state}</span>} /><DetailItem label={t("dealDetails.requestedAmount")} value={formatCurrency(deal.business.requestedAmount)} /></dl></section>
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><div className="flex items-center gap-2"><ContactIcon /><h2 className="font-extrabold text-[#16365D]">{t("dealDetails.primaryContact")}</h2></div><dl className="mt-3"><DetailItem label={t("dealDetails.contact")} value={deal.business.contact.name} /><DetailItem label={t("dealDetails.email")} value={<span className="inline-flex items-center"><Mail className="mr-1.5 h-3.5 w-3.5" />{deal.business.contact.email}</span>} /><DetailItem label={t("dealDetails.phone")} value={<span className="inline-flex items-center"><Phone className="mr-1.5 h-3.5 w-3.5" />{deal.business.contact.phone || t("common.notProvided")}</span>} /></dl></section>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><FileCheck2 className="h-5 w-5 text-[#4AB547]" /><h2 className="mt-3 font-extrabold text-[#16365D]">{t("dealDetails.docCompleteness")}</h2><p className="mt-2 text-3xl font-extrabold text-[#16365D]">{Math.min(100, Math.round((deal.documents.length / 6) * 100))}%</p><p className="mt-1 text-xs text-[#667085]">{deal.documents.length} {t("dealDetails.docCompletenessDesc")}</p></section>
            <section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><CheckCircle2 className="h-5 w-5 text-[#4AB547]" /><h2 className="mt-3 font-extrabold text-[#16365D]">{t("dealDetails.analysisStatus")}</h2><div className="mt-3"><StatusBadge status={deal.status} /></div><p className="mt-3 text-xs text-[#667085]">{analysis ? t("dealDetails.lastGenerated", { date: formatDate(analysis.generatedAt) }) : t("dealDetails.noAnalysis")}</p></section>
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><AlertTriangle className="h-5 w-5 text-amber-700" /><h2 className="mt-3 font-extrabold text-amber-900">{t("dealDetails.importantWarnings")}</h2><p className="mt-2 text-3xl font-extrabold text-amber-900">{analysis?.riskFlags.length ?? 0}</p><p className="mt-1 text-xs text-amber-800">{analysis ? t("dealDetails.riskFlagsReview") : t("dealDetails.runToScreen")}</p></section>
          </div>
        </TabsContent>
        <TabsContent value="documents" className="mt-0"><section className="overflow-hidden rounded-xl border border-[#DDE3E8] bg-white"><div className="flex items-center justify-between p-5"><div><h2 className="font-extrabold text-[#16365D]">{t("dealDetails.dealDocs")}</h2><p className="mt-1 text-xs text-[#667085]">{t("dealDetails.dealDocsDesc")}</p></div><Button variant="outline" onClick={() => toast.info(t("dealDetails.addUploadsMsg"))} className="rounded-lg border-[#BFC9D2]"><Upload className="mr-2 h-4 w-4" />{t("dealDetails.addDocs")}</Button></div>{deal.documents.length ? <DataTable columns={documentColumns} rows={deal.documents} rowKey={(d) => d.id} /> : <div className="p-5"><EmptyState title={t("dealDetails.noDocs")} message={t("dealDetails.noDocsMsg")} /></div>}</section></TabsContent>
        <TabsContent value="analysis" className="mt-0">{!analysis ? (
          <EmptyState title={t("dealDetails.noAnalysisTitle")} message={t("dealDetails.noAnalysisMsg")} action={<Button onClick={runAnalysis} disabled={running} className="rounded-lg bg-[#4AB547] font-bold hover:bg-[#3FA33D]"><Sparkles className="mr-2 h-4 w-4" />{running ? t("dealDetails.loadingSample") : t("dealDetails.runSampleAnalysis")}</Button>} />
        ) : (<div className="space-y-5">
          <div className="flex flex-col gap-3 rounded-xl border border-green-200 bg-[#F0FAF0] p-4 text-sm text-[#286C2A] sm:flex-row sm:items-center sm:justify-between"><div><strong>{t("status.completed")}</strong><span className="ml-2 text-[#417E43]">{t("dealDetails.generated", { date: formatDate(analysis.generatedAt) })}</span><div className="mt-1 text-xs text-[#417E43]">{t("dealDetails.analysisVersion", { version: analysis.analysisVersion })} • {t("dealDetails.promptVersion", { version: analysis.promptVersion })}{analysis.overallConfidence ? " • " + t("dealDetails.sampleConfidence", { pct: Math.round(analysis.overallConfidence * 100) }) : ""}</div></div><Button disabled variant="outline" className="rounded-lg border-green-300 bg-white text-[#286C2A]"><Download className="mr-2 h-4 w-4" />{t("dealDetails.exportSummary")} · {t("dealDetails.comingLater")}</Button></div>
          {analysis.warnings.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-extrabold text-amber-900">{t("dealDetails.sampleWarnings")}</h2><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{analysis.warnings.map((w) => <li key={w}>{w}</li>)}</ul></div></div></div>}
          <AnalysisSection title={t("dealDetails.execSummary")} description={t("dealDetails.execSummaryDesc")}>
            <p className="rounded-lg bg-[#F8FAFB] p-4 text-sm leading-relaxed text-[#344054]">{analysis.summary}</p>
            <dl className="mt-4 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4"><DetailItem label={t("dealDetails.businessName")} value={deal.business.legalName} /><DetailItem label={t("dealDetails.industry")} value={deal.business.industry} /><DetailItem label={t("dealDetails.timeInBusiness")} value={deal.business.startDate ? timeInBusiness(deal.business.startDate) : t("common.notProvided")} /><DetailItem label={t("dealDetails.state")} value={deal.business.state} /><DetailItem label={t("dealDetails.colOriginal")} value={formatCurrency(deal.business.requestedAmount)} /><DetailItem label={t("dealDetails.estMonthlyRevenue")} value={formatCurrency(analysis.estimatedMonthlyRevenue)} /><DetailItem label={t("dealDetails.existingFinancing")} value={analysis.existingFinancingPositions} /><DetailItem label={t("dealDetails.importantRiskFlags")} value={t("dealDetails.identified", { count: analysis.riskFlags.length })} /></dl>
            <div className="mt-4 rounded-lg border-l-4 border-[#4AB547] bg-[#F0FAF0] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#3A9738]">{t("dealDetails.cashFlowObs")}</p><p className="mt-1 text-sm leading-relaxed text-[#344054]">{analysis.cashFlowObservation}</p></div>
            {analysis.metricEvidence?.estimatedMonthlyRevenue?.length ? <div className="mt-4"><p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#667085]">{t("dealDetails.sourceEvidenceMetrics")}</p><SourceEvidenceList evidence={analysis.metricEvidence.estimatedMonthlyRevenue} /></div> : null}
          </AnalysisSection>
          <AnalysisSection title={t("dealDetails.bankSummary")} description={t("dealDetails.bankSummaryDesc")}><DataTable columns={bankColumns} rows={analysis.bankStatements} rowKey={(r) => r.month} /><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5"><SummaryCard label={t("dealDetails.avgAdjRevenue")} value={formatCurrency(averages.adjusted)} helper={t("dealDetails.primarySample")} icon={FileCheck2} tone="green" /><SummaryCard label={t("dealDetails.avgGross")} value={formatCurrency(averages.gross)} helper={t("dealDetails.beforeExclusions")} icon={FileCheck2} tone="navy" /><SummaryCard label={t("dealDetails.avgDailyBal")} value={formatCurrency(averages.balance)} helper={t("dealDetails.avgMonthlyAdb")} icon={CalendarDays} tone="navy" /><SummaryCard label={t("dealDetails.totalNegDays")} value={averages.negative} helper={t("dealDetails.acrossMonths")} icon={AlertTriangle} tone="amber" /><SummaryCard label={t("dealDetails.adjRevTrend")} value={averages.trend} helper={t("dealDetails.acrossMonths")} icon={MoreHorizontal} tone="amber" /></div></AnalysisSection>
          <AnalysisSection title={t("dealDetails.existingMca")} description={t("dealDetails.existingMcaDesc")}><DataTable columns={loanColumns} rows={analysis.existingLoans} rowKey={(r) => r.lender} /></AnalysisSection>
          <AnalysisSection title={t("dealDetails.recentFunding")} description={t("dealDetails.recentFundingDesc")}><DataTable columns={recentColumns} rows={analysis.recentFunding} rowKey={(r) => r.funder} /></AnalysisSection>
          <AnalysisSection title={t("dealDetails.taxSummary")} description={t("dealDetails.taxSummaryDesc")}><DataTable columns={taxColumns} rows={analysis.taxReturns} rowKey={(r) => String(r.taxYear)} /><div className="mt-4 grid gap-4 sm:grid-cols-2"><div className="rounded-lg border border-green-200 bg-green-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-green-700">{t("dealDetails.yoyChange")}</p><p className="mt-1 text-2xl font-extrabold text-green-800">+{analysis.revenueChange}%</p></div><div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-4"><p className="text-xs font-bold uppercase tracking-wide text-[#667085]">{t("dealDetails.taxBankCompare")}</p><p className="mt-1 text-sm leading-relaxed text-[#344054]">{analysis.taxBankInconsistency}</p></div></div></AnalysisSection>
          <AnalysisSection title={t("dealDetails.riskFlags")} description={t("dealDetails.riskFlagsDesc", { count: analysis.riskFlags.length })}><div className="space-y-3">{analysis.riskFlags.map((flag) => <RiskFlagCard key={flag.id} flag={flag} />)}</div></AnalysisSection>
          <AnalysisSection title={t("dealDetails.analystNotes")} description={t("dealDetails.analystNotesDesc")}><NoteEditor /></AnalysisSection>
        </div>) }
        </TabsContent>
        <TabsContent value="notes" className="mt-0"><AnalysisSection title={t("dealDetails.dealNotes")} description={t("dealDetails.dealNotesDesc")}><NoteEditor /></AnalysisSection></TabsContent>
      </Tabs>
      <ConfirmationDialog open={Boolean(deleteDocumentId)} onOpenChange={(open) => !open && setDeleteDocumentId(null)} title={t("dealDetails.removeDocTitle")} description={t("dealDetails.removeDocDesc")} confirmLabel={t("dealDetails.removeDoc")} onConfirm={removeDocument} />
    </>
  );
};

const BuildingIcon = () => <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F8]"><Pencil className="h-4 w-4 text-[#16365D]" /></span>;
const ContactIcon = () => <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF3F8]"><Mail className="h-4 w-4 text-[#16365D]" /></span>;

export default DealDetails;