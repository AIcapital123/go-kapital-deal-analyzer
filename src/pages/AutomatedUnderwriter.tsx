import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Building2, Check, ChevronLeft, ChevronRight,
  Clock3, CreditCard, FileCheck2, FileSearch, Globe, Info,
  LoaderCircle, Sparkles, TrendingDown, UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage, PageHeader, SummaryCard } from "@/components/Common";
import { DataTable, type TableColumn } from "@/components/DataTable";
import { RiskFlagCard } from "@/components/RiskFlagCard";
import { DocumentList } from "@/components/DocumentList";
import { FileUploader } from "@/components/FileUploader";
import { documentExtractionService, keyToLabel } from "@/services/documentExtractionService";
import { publicBusinessResearchService } from "@/services/publicBusinessResearchService";
import { underwritingAnalysisService } from "@/services/underwritingAnalysisService";
import { dealStorage } from "@/services/dealStorage";
import { filesToDocuments, getStatementWarnings } from "@/services/documentStorage";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  BankStatementMonth, Business, Deal, Document, ExistingLoan,
  ExtractedBusinessProfile, ProfileConflict, ProfileExtractionResult,
  PublicResearchResult, TaxReturnSummary, UnderwritingSummary,
} from "@/types/deal";
import {
  ConflictResolver, DisabledFutureButton, ExtractedFieldRow,
  LendingSafeguard, ProfileReviewField, ResearchSourceCard,
  SampleNotice, SectionCard,
} from "@/components/underwriter/UnderwriterHelpers";

const steps = [
  { number: 1, title: "Upload Documents", icon: UploadCloud },
  { number: 2, title: "Extract Application & Business Info", icon: FileSearch },
  { number: 3, title: "Search Public Business Info", icon: Globe },
  { number: 4, title: "Review & Confirm Profile", icon: FileCheck2 },
  { number: 5, title: "Generate Revenue Summary", icon: Sparkles },
];

const profileFields: { key: keyof ExtractedBusinessProfile; label: string }[] = [
  { key: "legalBusinessName", label: "Legal Business Name" },
  { key: "dbaName", label: "DBA Name" },
  { key: "ownerName", label: "Primary Contact / Owner" },
  { key: "businessAddress", label: "Business Address" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone Number" },
  { key: "industry", label: "Industry" },
  { key: "businessStartDate", label: "Business Start Date" },
  { key: "timeInBusiness", label: "Time in Business" },
  { key: "requestedLoanAmount", label: "Requested Loan Amount" },
  { key: "useOfFunds", label: "Use of Funds" },
  { key: "ownershipInfo", label: "Ownership Information" },
  { key: "einLastFour", label: "EIN (last four)" },
];

const extractState = (address: string): string => {
  const m = address.match(/\b([A-Z]{2})\s+\d{5}/);
  return m ? m[1] : "";
};

const profileToBusiness = (p: ExtractedBusinessProfile): Business => ({
  legalName: p.legalBusinessName.value || "",
  dbaName: p.dbaName.value || "",
  industry: p.industry.value || "",
  state: extractState(p.businessAddress.value),
  startDate: p.businessStartDate.value || "",
  requestedAmount: typeof p.requestedLoanAmount.value === "number" ? p.requestedLoanAmount.value : Number(p.requestedLoanAmount.value) || 0,
  contact: { name: p.ownerName.value || "", email: p.email.value || "", phone: p.phone.value || "" },
  notes: p.useOfFunds.value || "",
});

const convertSummary = (s: UnderwritingSummary, docs: Document[]) => ({
  generatedAt: s.generatedAt, dataSource: "sample" as const, model: "sample-ruleset",
  promptVersion: "sample-underwriter-v1", analysisVersion: "2025.06-underwriter-sample",
  documentIds: docs.map((d) => d.id), warnings: s.warnings, overallConfidence: 0.87,
  estimatedMonthlyRevenue: s.averageMonthlyAdjustedRevenue,
  existingFinancingPositions: s.existingLoans.length,
  cashFlowObservation: "Adjusted business revenue remains positive, but balances tightened in the two most recent months while daily debt service remained elevated.",
  summary: `AI Underwriter sample summary for ${s.businessProfile.legalBusinessName.value}.`,
  bankStatements: s.bankStatements, existingLoans: s.existingLoans,
  recentFunding: s.recentFunding, taxReturns: s.taxReturns,
  revenueChange: 11.1,
  taxBankInconsistency: "Annualized sample adjusted bank revenue is approximately 4.8% below reported gross revenue. Manual reconciliation is recommended.",
  riskFlags: s.riskFlags,
});

const Stepper = ({ step }: { step: number }) => (
  <div className="mb-6 rounded-xl border border-[#DDE3E8] bg-white p-4 sm:p-5">
    <ol className="grid gap-3 sm:grid-cols-5">
      {steps.map(({ number, title, icon: Icon }, index) => {
        const complete = number < step;
        const active = number === step;
        return (
          <li key={number} className="relative flex items-center gap-3">
            <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold", complete && "border-[#4AB547] bg-[#4AB547] text-white", active && "border-[#16365D] bg-[#16365D] text-white", !complete && !active && "border-[#DDE3E8] bg-[#F5F7F9] text-[#667085]")}>
              {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#98A2B3]">Step {number}</p>
              <p className={cn("truncate text-sm font-bold", active || complete ? "text-[#16365D]" : "text-[#667085]")}>{title}</p>
            </div>
            {index < steps.length - 1 && <div className="absolute left-11 top-4 -z-10 hidden h-px w-full bg-[#DDE3E8] sm:block" />}
          </li>
        );
      })}
    </ol>
  </div>
);


const AutomatedUnderwriter = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [extraction, setExtraction] = useState<ProfileExtractionResult | null>(null);
  const [publicResearch, setPublicResearch] = useState<PublicResearchResult | null>(null);
  const [profile, setProfile] = useState<ExtractedBusinessProfile | null>(null);
  const [conflicts, setConflicts] = useState<ProfileConflict[]>([]);
  const [summary, setSummary] = useState<UnderwritingSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const statementCount = documents.filter((d) => d.category === "Bank statement").length;
  const hasApplication = documents.some((d) => d.category === "Business loan application");
  const statementWarnings = useMemo(() => getStatementWarnings(documents), [documents]);

  const updateDocPeriod = (id: string, month?: number, year?: number) => {
    setDocuments((cur) => cur.map((d) => d.id === id ? { ...d, statementMonth: month, statementYear: year } : d));
  };

  const runSampleExtraction = async () => {
    if (!documents.length) { setError("Upload at least one document before extraction."); return; }
    setBusy(true); setError("");
    try {
      const result = await documentExtractionService.extract(documents);
      setExtraction(result);
      setProfile(JSON.parse(JSON.stringify(result.businessProfile)) as ExtractedBusinessProfile);
      setConflicts(result.conflicts.map((c) => ({ ...c })));
      toast.success("Sample extraction complete");
    } catch { setError("Sample extraction could not be completed."); }
    finally { setBusy(false); }
  };

  const runSampleResearch = async () => {
    setBusy(true); setError("");
    try {
      const result = await publicBusinessResearchService.search(documents);
      setPublicResearch(result);
      setConflicts((cur) => {
        const keys = new Set(cur.map((c) => c.fieldKey));
        const merged = [...cur];
        result.conflicts.forEach((c) => { if (!keys.has(c.fieldKey)) merged.push({ ...c }); });
        return merged;
      });
      toast.success("Sample public research complete");
    } catch { setError("Sample public research could not be completed."); }
    finally { setBusy(false); }
  };

  const editField = (key: keyof ExtractedBusinessProfile, value: string) => {
    setProfile((cur) => cur ? { ...cur, [key]: { ...cur[key], value: key === "requestedLoanAmount" ? Number(value) || 0 : value, source: "user_manual", confidence: 1, reviewStatus: "user_confirmed", userEdited: true } } : null);
  };

  const confirmField = (key: keyof ExtractedBusinessProfile) => {
    setProfile((cur) => cur ? { ...cur, [key]: { ...cur[key], reviewStatus: "user_confirmed", confidence: 1 } } : null);
  };

  const resolveConflict = (index: number, resolution: ProfileConflict["resolution"], value?: string) => {
    setConflicts((cur) => cur.map((c, i) => i === index ? { ...c, resolution, resolvedValue: value } : c));
    const conflict = conflicts[index];
    if (!conflict || !profile || !resolution) return;
    const fieldKey = conflict.fieldKey as keyof ExtractedBusinessProfile;
    if (fieldKey in profile) {
      if (resolution === "application" || resolution === "public") {
        setProfile((cur) => cur ? { ...cur, [fieldKey]: { ...cur[fieldKey], value: resolution === "application" ? conflict.applicationValue : conflict.publicValue, source: resolution === "public" ? "public_record" : cur[fieldKey].source, confidence: resolution === "public" ? 0.9 : cur[fieldKey].confidence, reviewStatus: resolution === "public" ? "publicly_corroborated" : "user_confirmed", userEdited: true } } : null);
      } else if (resolution === "manual" && value) {
        setProfile((cur) => cur ? { ...cur, [fieldKey]: { ...cur[fieldKey], value, source: "user_manual", confidence: 1, reviewStatus: "user_confirmed", userEdited: true } } : null);
      }
    }
  };

  const runSampleSummary = async () => {
    if (!profile) return;
    if (!documents.some((d) => d.category === "Bank statement")) { setError("At least one bank statement is required to generate a bank revenue summary."); return; }
    setBusy(true); setError("");
    try {
      const result = await underwritingAnalysisService.generate(profile, publicResearch, documents);
      setSummary(result);
      toast.success("Sample underwriting summary generated");
    } catch { setError("Sample summary could not be completed."); }
    finally { setBusy(false); }
  };

  const createDeal = () => {
    if (!profile || !summary) return;
    setCreating(true);
    const now = new Date().toISOString();
    const business = profileToBusiness(profile);
    const deal: Deal = {
      id: `deal-${Date.now()}`, business, documents, status: "completed",
      createdAt: now, updatedAt: now, entryMode: "automated",
      extractionResult: extraction ?? undefined,
      publicResearchResult: publicResearch ?? undefined,
      analysis: convertSummary(summary, documents),
    };
    dealStorage.create(deal);
    toast.success("Deal created", { description: `${business.legalName} is available on the dashboard.` });
    navigate(`/deals/${deal.id}?tab=analysis`);
  };

  const goNext = () => {
    setError("");
    if (step === 1 && !documents.length) { setError("Upload at least one document to continue."); return; }
    setStep((s) => Math.min(5, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => { setError(""); setStep((s) => Math.max(1, s - 1)); };


  if (creating) {
    return (
      <>
        <PageHeader title="Creating Deal" />
        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-[#DDE3E8] bg-white p-8 text-center">
          <LoaderCircle className="h-12 w-12 animate-spin text-[#4AB547]" />
          <h2 className="mt-6 text-xl font-extrabold text-[#16365D]">Saving your deal...</h2>
          <p className="mt-2 max-w-md text-sm text-[#667085]">Routing to the Deal Details page.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <button onClick={() => navigate("/")} className="mb-4 inline-flex items-center text-sm font-bold text-[#667085] hover:text-[#16365D]">
        <ChevronLeft className="mr-1 h-4 w-4" />Back to Dashboard
      </button>
      <PageHeader title="Automated AI Underwriter" subtitle="Upload documents, extract the business profile, research public records, and prepare a revenue summary." />
      <Stepper step={step} />
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      {step === 1 && (
        <section className="space-y-5">
          <div className="rounded-xl border border-[#DDE3E8] bg-white p-5">
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p>Upload a completed loan application to extract the client's contact information, industry, requested amount, and business history. Bank statements can be used independently to prepare a revenue and cash-flow summary.</p>
            </div>
            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-3 text-center"><p className="text-xs font-semibold text-[#667085]">Bank statements</p><p className="mt-1 text-2xl font-extrabold text-[#16365D]">{statementCount}</p><p className="text-[11px] text-[#98A2B3]">{statementCount >= 4 ? "Good coverage" : "4-12 recommended"}</p></div>
              <div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-3 text-center"><p className="text-xs font-semibold text-[#667085]">Loan application</p><p className="mt-1 text-2xl font-extrabold text-[#16365D]">{hasApplication ? "Yes" : "No"}</p><p className="text-[11px] text-[#98A2B3]">{hasApplication ? "Will populate contacts" : "Contacts blank"}</p></div>
              <div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-3 text-center"><p className="text-xs font-semibold text-[#667085]">Tax returns</p><p className="mt-1 text-2xl font-extrabold text-[#16365D]">{documents.filter((d) => d.category === "Tax return").length}</p></div>
              <div className="rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-3 text-center"><p className="text-xs font-semibold text-[#667085]">Total documents</p><p className="mt-1 text-2xl font-extrabold text-[#16365D]">{documents.length}</p><p className="text-[11px] text-[#98A2B3]">of 20 max</p></div>
            </div>
            <FileUploader documents={documents} onFiles={(files) => setDocuments((cur) => [...cur, ...filesToDocuments(files)])} onError={setError} />
            <DocumentList documents={documents} onCategoryChange={(id, category) => setDocuments((cur) => cur.map((d) => d.id === id ? { ...d, category, ...(category !== "Bank statement" ? { statementMonth: undefined, statementYear: undefined, period: undefined } : {}) } : d))} onPeriodChange={updateDocPeriod} onRemove={(id) => setDocuments((cur) => cur.filter((d) => d.id !== id))} />
            {statementWarnings.length > 0 && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h3 className="text-sm font-extrabold text-amber-900">Bank statement review</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{statementWarnings.map((w) => <li key={w}>{w}</li>)}</ul></div></div></div>
            )}
          </div>
          <div className="flex justify-end"><Button onClick={goNext} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]">Continue to Extraction <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-5">
          <SampleNotice />
          <div className="rounded-xl border border-[#DDE3E8] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E7EBEF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-extrabold text-[#16365D]">Application & Document Extraction</h2><p className="mt-1 text-xs text-[#667085]">Fields extracted from the loan application and supporting documents.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={runSampleExtraction} disabled={busy} className="rounded-lg bg-[#4AB547] font-bold hover:bg-[#3FA33D]">{busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Use Sample Document Extraction</Button>
                <DisabledFutureButton label="Extract Uploaded Documents - AI connection required" />
              </div>
            </div>
            {busy && !extraction && <div className="flex flex-col items-center justify-center p-12 text-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#4AB547]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">Loading sample extraction...</p></div>}
            {extraction && (
              <div className="space-y-4 p-5">
                {extraction.warnings.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><ul className="space-y-1 text-sm text-amber-800">{extraction.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div></div>}
                <div className="grid gap-3 lg:grid-cols-2">{profileFields.map(({ key, label }) => <ExtractedFieldRow key={key} label={label} field={extraction.businessProfile[key]} />)}</div>
                {extraction.missingFields.length > 0 && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4"><h3 className="text-sm font-extrabold text-[#16365D]">Missing Information</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-[#667085]">{extraction.missingFields.map((m) => <li key={m.fieldKey}>{m.fieldLabel}: Not found in uploaded documents.</li>)}</ul></div>
                )}
              </div>
            )}
            {!extraction && !busy && <div className="p-8 text-center"><FileSearch className="mx-auto h-10 w-10 text-[#DDE3E8]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">No extraction data yet</p><p className="mt-1 text-xs text-[#667085]">Click "Use Sample Document Extraction" to load simulated results.</p></div>}
          </div>
          <div className="flex justify-between"><Button variant="outline" onClick={goBack} className="rounded-lg border-[#C9D2DA]"><ChevronLeft className="mr-2 h-4 w-4" />Back</Button><Button onClick={goNext} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]">Continue to Public Research <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        </section>
      )}

      {step === 3 && (
        <section className="space-y-5">
          <SampleNotice />
          <div className="rounded-xl border border-[#DDE3E8] bg-white">
            <div className="flex flex-col gap-3 border-b border-[#E7EBEF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div><h2 className="font-extrabold text-[#16365D]">Public Business Research</h2><p className="mt-1 text-xs text-[#667085]">Corroborate business details against public records, official websites, and verified directories.</p></div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button onClick={runSampleResearch} disabled={busy} className="rounded-lg bg-[#4AB547] font-bold hover:bg-[#3FA33D]">{busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Globe className="mr-2 h-4 w-4" />}Use Sample Public Research</Button>
                <DisabledFutureButton label="Search Public Business Data - secure AI connection required" />
              </div>
            </div>
            {busy && !publicResearch && <div className="flex flex-col items-center justify-center p-12 text-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#4AB547]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">Searching sample public records...</p></div>}
            {publicResearch && (
              <div className="space-y-5 p-5">
                {publicResearch.warnings.length > 0 && <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" /><ul className="space-y-1 text-sm text-amber-800">{publicResearch.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div></div>}
                {publicResearch.profile ? (
                  <>
                    <div><h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#16365D]"><Building2 className="h-4 w-4" />Public Business Profile</h3><div className="grid gap-3 lg:grid-cols-2">{Object.entries(publicResearch.profile).filter(([k]) => k !== "sources").map(([key, field]) => <ExtractedFieldRow key={key} label={keyToLabel(key)} field={field} />)}</div></div>
                    <div><h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#16365D]"><Globe className="h-4 w-4" />Public Research Sources</h3><div className="grid gap-3 lg:grid-cols-2">{publicResearch.profile.sources.map((src, i) => <ResearchSourceCard key={i} source={src} />)}</div></div>
                  </>
                ) : (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 text-center"><Globe className="mx-auto h-8 w-8 text-slate-400" /><p className="mt-2 text-sm font-semibold text-[#16365D]">No sufficiently reliable public business match found.</p><p className="mt-1 text-xs text-[#667085]">You can still proceed with the application information.</p></div>
                )}
              </div>
            )}
            {!publicResearch && !busy && <div className="p-8 text-center"><Globe className="mx-auto h-10 w-10 text-[#DDE3E8]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">No public research yet</p></div>}
          </div>
          <div className="flex justify-between"><Button variant="outline" onClick={goBack} className="rounded-lg border-[#C9D2DA]"><ChevronLeft className="mr-2 h-4 w-4" />Back</Button><Button onClick={goNext} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]">Continue to Profile Review <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
        </section>
      )}

      {step === 4 && (
        <section className="space-y-5">
          {!profile ? (
            <div className="rounded-xl border border-[#DDE3E8] bg-white p-8 text-center"><p className="text-sm text-[#667085]">Return to Step 2 to run sample extraction first.</p><Button onClick={() => setStep(2)} className="mt-4 rounded-lg bg-[#16365D]">Go to Extraction</Button></div>
          ) : (
            <>
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
                <p>Review every field below. You can accept the application value, accept a public-record value, enter a correction manually, or continue with incomplete information. Manual corrections have the highest priority.</p>
              </div>
              {conflicts.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-white">
                  <div className="border-b border-amber-100 px-5 py-4"><h2 className="flex items-center gap-2 font-extrabold text-amber-900"><AlertTriangle className="h-5 w-5" />Conflicts Requiring Review</h2><p className="mt-1 text-xs text-amber-700">Application and public-record values disagree. Choose which to keep.</p></div>
                  <div className="space-y-4 p-5">{conflicts.map((c, i) => <ConflictResolver key={i} conflict={c} onResolve={(res, val) => resolveConflict(i, res, val)} />)}</div>
                </div>
              )}
              <div className="rounded-xl border border-[#DDE3E8] bg-white">
                <div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">Application Information</h2><p className="mt-1 text-xs text-[#667085]">Fields extracted from uploaded documents. Edit or confirm each field.</p></div>
                <div className="grid gap-3 p-5 lg:grid-cols-2">{profileFields.map(({ key, label }) => <ProfileReviewField key={key} label={label} field={profile[key]} onEdit={(v) => editField(key, v)} onConfirm={() => confirmField(key)} />)}</div>
              </div>
              {publicResearch?.profile && (
                <div className="rounded-xl border border-[#DDE3E8] bg-white">
                  <div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="flex items-center gap-2 font-extrabold text-[#16365D]"><Globe className="h-5 w-5" />Public Business Research</h2><p className="mt-1 text-xs text-[#667085]">Corroborated information from public sources. Values do not overwrite application data.</p></div>
                  <div className="grid gap-3 p-5 lg:grid-cols-2">{Object.entries(publicResearch.profile).filter(([k]) => k !== "sources").map(([key, field]) => <ExtractedFieldRow key={key} label={keyToLabel(key)} field={field} />)}</div>
                </div>
              )}
              {(() => { const missing = profileFields.filter(({ key }) => profile[key].reviewStatus === "not_found"); if (!missing.length) return null; return (
                <div className="rounded-xl border border-slate-200 bg-slate-50"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-extrabold text-[#16365D]">Missing Information</h2></div><div className="p-5"><ul className="list-disc space-y-1 pl-4 text-sm text-[#667085]">{missing.map(({ label }) => <li key={label}>{label}: Not found in uploaded documents.</li>)}</ul></div></div>
              ); })()}
              <div className="flex justify-between">
                <Button variant="outline" onClick={goBack} className="rounded-lg border-[#C9D2DA]"><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>
                <div className="flex items-center gap-3">{!profile.legalBusinessName.value && <span className="text-xs font-semibold text-amber-700">A legal business name is required to continue.</span>}<Button onClick={goNext} disabled={!profile.legalBusinessName.value} className="rounded-lg bg-[#16365D] font-bold hover:bg-[#102B4B]">Continue to Summary <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
              </div>
            </>
          )}
        </section>
      )}

      {step === 5 && (
        <section className="space-y-5">
          {!summary ? (
            <div className="rounded-xl border border-[#DDE3E8] bg-white">
              <div className="flex flex-col gap-3 border-b border-[#E7EBEF] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div><h2 className="font-extrabold text-[#16365D]">Revenue & Underwriting Summary</h2><p className="mt-1 text-xs text-[#667085]">Generate a structured summary from the confirmed profile and uploaded documents.</p></div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button onClick={runSampleSummary} disabled={busy} className="rounded-lg bg-[#4AB547] font-bold hover:bg-[#3FA33D]">{busy ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Run Sample Underwriting Summary</Button>
                  <DisabledFutureButton label="Analyze Uploaded Documents - AI connection required" />
                </div>
              </div>
              {busy ? <div className="flex flex-col items-center justify-center p-12 text-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#4AB547]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">Generating sample underwriting summary...</p></div> : <div className="p-8 text-center"><Sparkles className="mx-auto h-10 w-10 text-[#DDE3E8]" /><p className="mt-3 text-sm font-semibold text-[#16365D]">No summary yet</p><p className="mt-1 text-xs text-[#667085]">Click "Run Sample Underwriting Summary" to load simulated results.</p></div>}
            </div>
          ) : (
            <SummaryView summary={summary} documents={documents} />
          )}
          {summary && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={goBack} className="rounded-lg border-[#C9D2DA]"><ChevronLeft className="mr-2 h-4 w-4" />Back to Review</Button>
              <Button onClick={createDeal} className="rounded-lg bg-[#4AB547] px-6 font-bold text-white hover:bg-[#3FA33D]">Create Deal & View Details <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </div>
          )}
        </section>
      )}
    </>
  );
};

const SummaryView = ({ summary }: { summary: UnderwritingSummary; documents: Document[] }) => {
  const bankCols: TableColumn<BankStatementMonth>[] = [
    { key: "month", header: "Month", render: (r) => <span className="font-bold text-[#16365D]">{r.month}</span> },
    { key: "gross", header: "Gross Deposits", render: (r) => formatCurrency(r.grossDeposits) },
    { key: "transfers", header: "Transfers", render: (r) => formatCurrency(r.transfersExcluded) },
    { key: "loan", header: "Loan/MCA", render: (r) => formatCurrency(r.loanOrMcaProceedsExcluded) },
    { key: "returns", header: "Returns", render: (r) => formatCurrency(r.returnedDepositsExcluded) },
    { key: "other", header: "Other", render: (r) => formatCurrency(r.otherExclusions) },
    { key: "adjusted", header: "Adjusted Revenue", render: (r) => <span className="font-extrabold text-[#3A9738]">{formatCurrency(r.adjustedBusinessRevenue)}</span> },
    { key: "adb", header: "Avg Daily Balance", render: (r) => formatCurrency(r.averageDailyBalance) },
    { key: "neg", header: "Neg Days", render: (r) => <span className={r.negativeBalanceDays ? "font-bold text-amber-700" : "text-green-700"}>{r.negativeBalanceDays}</span> },
    { key: "nsf", header: "NSF", render: (r) => <span className={r.nsfCount ? "font-bold text-red-700" : "text-green-700"}>{r.nsfCount}</span> },
  ];
  const loanCols: TableColumn<ExistingLoan>[] = [
    { key: "lender", header: "Lender", render: (r) => <span className="font-bold text-[#16365D]">{r.lender}</span> },
    { key: "debit", header: "Observed Debit", render: (r) => formatCurrency(r.observedDebit) },
    { key: "freq", header: "Frequency", render: (r) => r.frequency },
    { key: "monthly", header: "Est. Monthly Payment", render: (r) => formatCurrency(r.estimatedMonthlyPayment) },
    { key: "status", header: "Status", render: (r) => <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{r.status}</span> },
  ];
  return (
    <div className="space-y-5">
      <LendingSafeguard />
      {summary.warnings.length > 0 && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-extrabold text-amber-900">Warnings</h2><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{summary.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div></div></div>}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Avg Monthly Gross Deposits" value={formatCurrency(summary.averageMonthlyGrossDeposits)} helper="Before exclusions" icon={FileCheck2} tone="navy" />
        <SummaryCard label="Avg Monthly Adjusted Revenue" value={formatCurrency(summary.averageMonthlyAdjustedRevenue)} helper="Primary revenue measure" icon={FileCheck2} tone="green" />
        <SummaryCard label="Average Daily Balance" value={formatCurrency(summary.averageDailyBalance)} helper="Average of monthly ADB" icon={Clock3} tone="navy" />
        <SummaryCard label="Revenue Trend" value={summary.revenueTrend} helper="Most recent period" icon={TrendingDown} tone="amber" />
        <SummaryCard label="Total Negative Days" value={summary.totalNegativeDays} helper="Across all months" icon={AlertTriangle} tone="amber" />
        <SummaryCard label="Total NSF/Overdraft" value={summary.totalNsfEvents} helper="Across all months" icon={AlertTriangle} tone="amber" />
        <SummaryCard label="Existing Financing Positions" value={summary.existingLoans.length} helper="Observed obligations" icon={CreditCard} tone="navy" />
        <SummaryCard label="Est. Monthly Payments" value={formatCurrency(summary.estimatedMonthlyFinancingPayments)} helper="From existing positions" icon={CreditCard} tone="navy" />
      </div>
      <SectionCard title="1. Confirmed Business Profile">
        <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(summary.businessProfile).map(([key, field]) => <div key={key}><dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{keyToLabel(key)}</dt><dd className="mt-0.5 text-sm font-bold text-[#16365D]">{field.reviewStatus === "not_found" ? "-" : field.value || "-"}</dd></div>)}</dl>
      </SectionCard>
      {summary.publicResearch?.profile && (
        <SectionCard title="2. Public Business Research">
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(summary.publicResearch.profile).filter(([k]) => k !== "sources").map(([key, field]) => <div key={key}><dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{keyToLabel(key)}</dt><dd className="mt-0.5 text-sm font-bold text-[#1B7AC4]">{field.value || "-"}</dd></div>)}</div>
          <div className="grid gap-3 lg:grid-cols-2">{summary.publicResearch.profile.sources.map((src, i) => <ResearchSourceCard key={i} source={src} />)}</div>
        </SectionCard>
      )}
      <SectionCard title="3. Bank Statement Revenue Summary" description="Adjusted business revenue = gross deposits - transfers - loan/MCA proceeds - returned deposits - other non-operating deposits"><DataTable columns={bankCols} rows={summary.bankStatements} rowKey={(r) => r.month} /></SectionCard>
      <SectionCard title="4. Existing MCA and Loan Positions">{summary.existingLoans.length > 0 ? <DataTable columns={loanCols} rows={summary.existingLoans} rowKey={(r) => r.lender} /> : <p className="text-sm text-[#667085]">No existing financing positions identified.</p>}</SectionCard>
      <SectionCard title="5. Potential Funding Deposits">{summary.recentFunding.length > 0 ? <div className="space-y-2">{summary.recentFunding.map((f, i) => <div key={i} className="flex items-center justify-between rounded-lg border border-[#DDE3E8] bg-[#F8FAFB] p-3 text-sm"><span className="font-bold text-[#16365D]">{f.funder}</span><span className="text-[#667085]">{f.depositDate} . {formatCurrency(f.depositAmount)}</span></div>)}</div> : <p className="text-sm text-[#667085]">No potential funding deposits identified.</p>}</SectionCard>
      {summary.taxReturns.length > 0 && (
        <SectionCard title="7. Tax Return Summary"><DataTable columns={[{ key: "year", header: "Tax Year", render: (r: TaxReturnSummary) => <span className="font-bold text-[#16365D]">{r.taxYear}</span> }, { key: "rev", header: "Gross Revenue", render: (r: TaxReturnSummary) => formatCurrency(r.grossRevenue) }, { key: "cogs", header: "COGS", render: (r: TaxReturnSummary) => formatCurrency(r.costOfGoodsSold) }, { key: "profit", header: "Gross Profit", render: (r: TaxReturnSummary) => formatCurrency(r.grossProfit) }, { key: "income", header: "Net Income", render: (r: TaxReturnSummary) => formatCurrency(r.netIncome) }]} rows={summary.taxReturns} rowKey={(r) => String(r.taxYear)} /></SectionCard>
      )}
      <SectionCard title="8. Risk and Review Flags"><div className="space-y-3">{summary.riskFlags.map((flag) => <RiskFlagCard key={flag.id} flag={flag} />)}</div></SectionCard>
      {summary.missingInfo.length > 0 && <SectionCard title="9. Missing Information"><ul className="list-disc space-y-1 pl-4 text-sm text-[#667085]">{summary.missingInfo.map((m, i) => <li key={i}>{m.fieldLabel}: Not found in uploaded documents.</li>)}</ul></SectionCard>}
      <SectionCard title="10. Analyst Notes"><Textarea placeholder="Add underwriting observations, follow-up requests, or deal context..." className="min-h-24 rounded-lg border-[#DDE3E8]" defaultValue={summary.analystNotes} /></SectionCard>
      <LendingSafeguard />
    </div>
  );
};

export default AutomatedUnderwriter;
