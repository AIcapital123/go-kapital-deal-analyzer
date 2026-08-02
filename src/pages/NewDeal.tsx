import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Building2, Check, ChevronLeft, ChevronRight, FileCheck2, Files, LoaderCircle, Save, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorMessage, PageHeader } from "@/components/Common";
import { DocumentList } from "@/components/DocumentList";
import { FileUploader } from "@/components/FileUploader";
import { filesToDocuments, getStatementWarnings } from "@/services/documentStorage";
import { dealStorage } from "@/services/dealStorage";
import { analyzeDeal } from "@/services/analysisService";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Business, Deal, DocumentCategory } from "@/types/deal";

const industries = ["Construction", "Healthcare", "Medical supplies", "Professional services", "Restaurant", "Retail", "Transportation", "Wholesale / distribution", "Other"];
const states = ["CA", "FL", "GA", "IL", "NJ", "NY", "NC", "PA", "SC", "TX", "VA", "Other"];
const initialBusiness: Business = { legalName: "", dbaName: "", requestedAmount: 0, industry: "", state: "", startDate: "", contact: { name: "", email: "", phone: "" }, notes: "" };

const NewDeal = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState(initialBusiness);
  const [documents, setDocuments] = useState<Deal["documents"]>([]);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const updateBusiness = <K extends keyof Business>(key: K, value: Business[K]) => setBusiness((c) => ({ ...c, [key]: value }));
  const updateContact = (key: keyof Business["contact"], value: string) => setBusiness((c) => ({ ...c, contact: { ...c.contact, [key]: value } }));
  const validateBusiness = () => {
    if (!business.legalName.trim() || !business.requestedAmount || !business.industry || !business.state || !business.contact.name.trim() || !business.contact.email.trim()) { setError(t("newDeal.validation.required")); return false; }
    if (!/^\S+@\S+\.\S+$/.test(business.contact.email)) { setError(t("newDeal.validation.email")); return false; }
    setError(""); return true;
  };
  const goNext = () => { if (step === 1 && !validateBusiness()) return; setError(""); setStep((c) => Math.min(3, c + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const stepsArr = [{ n: 1, title: t("newDeal.step1"), icon: Building2 }, { n: 2, title: t("newDeal.step2"), icon: Files }, { n: 3, title: t("newDeal.step3"), icon: FileCheck2 }];
  const categoryCount = (cat: DocumentCategory) => documents.filter((d) => d.category === cat).length;
  const missingItems = useMemo(() => {
    const m: string[] = [];
    if (!categoryCount("Business loan application")) m.push(t("newDeal.missingLoanApp"));
    const need = 4 - categoryCount("Bank statement");
    if (need > 0) m.push(need + " " + (need === 1 ? t("newDeal.additionalStmt") : t("newDeal.additionalStmts")));
    if (!categoryCount("Tax return")) m.push(t("newDeal.missingTaxReturn"));
    return m;
  }, [documents, t]);
  const statementWarnings = useMemo(() => getStatementWarnings(documents), [documents]);
  const updateDocumentPeriod = (id: string, month?: number, year?: number) => setDocuments((cur) => cur.map((d) => d.id === id ? { ...d, statementMonth: month, statementYear: year } : d));
  const buildDeal = (status: Deal["status"]): Deal => { const now = new Date().toISOString(); return { id: "deal-" + Date.now(), business, documents, status, createdAt: now, updatedAt: now, entryMode: "manual" }; };
  const saveDraft = () => { const deal = dealStorage.create(buildDeal("draft")); toast.success(t("newDeal.draftSaved"), { description: t("newDeal.draftSavedDesc", { name: business.legalName || t("newDeal.untitled") }) }); navigate("/deals/" + deal.id); };
  const runAnalysis = async () => { if (!validateBusiness()) { setStep(1); return; } const deal = dealStorage.create(buildDeal("analyzing")); setAnalyzing(true); try { const analysis = await analyzeDeal(deal); dealStorage.update(deal.id, { analysis, status: analysis.riskFlags.some((f) => f.severity === "High") ? "needs_review" : "completed" }); toast.success(t("newDeal.analysisComplete"), { description: t("newDeal.analysisCompleteDesc") }); navigate("/deals/" + deal.id + "?tab=analysis"); } catch { dealStorage.updateStatus(deal.id, "error"); setError(t("newDeal.analysisError")); setAnalyzing(false); } };
  if (analyzing) {
    return (<>
      <PageHeader title={t("newDeal.runningTitle")} subtitle={business.legalName} />
      <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-[#DDE3E8] bg-white p-8 text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF9EE] text-[#3A9738]"><LoaderCircle className="h-10 w-10 animate-spin" /><Sparkles className="absolute -right-1 top-0 h-5 w-5" /></div>
        <h2 className="mt-6 text-xl font-extrabold text-[#16365D]">{t("newDeal.runningDesc")}</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-[#667085]">{t("newDeal.runningMsg")}</p>
        <div className="mt-6 w-full max-w-sm overflow-hidden rounded-full bg-[#E7EBEF]"><div className="h-2 w-4/5 animate-pulse rounded-full bg-[#4AB547]" /></div>
      </div></>
    );
  }

  const Field = ({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1.5"><Label htmlFor={id} className="text-sm font-bold text-[#344054]">{label}{required && <span className="ml-1 text-red-600">*</span>}</Label>{children}</div>
  );

  return (
    <>
      <PageHeader title={t("newDeal.title")} subtitle={t("newDeal.subtitle")} />
      <div className="mb-6 rounded-xl border border-[#DDE3E8] bg-white p-4 sm:p-5">
        <ol className="grid gap-3 sm:grid-cols-3">
          {stepsArr.map(({ n, title, icon: Icon }, index) => { const complete = n < step; const active = n === step; return (
            <li key={n} className="relative flex items-center gap-3"><div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold", complete && "border-[#4AB547] bg-[#4AB547] text-white", active && "border-[#16365D] bg-[#16365D] text-white", !complete && !active && "border-[#DDE3E8] bg-[#F5F7F9] text-[#667085]")}>{complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}</div><div><p className="text-[11px] font-bold uppercase tracking-wide text-[#98A2B3]">{t("newDeal.step")} {n}</p><p className={cn("text-sm font-bold", active || complete ? "text-[#16365D]" : "text-[#667085]")}>{title}</p></div>{index < stepsArr.length - 1 && <div className="absolute left-11 right-0 top-4 -z-10 hidden h-px bg-[#DDE3E8] sm:block" />}</li>
          ); })}
        </ol>
      </div>
      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}
      <form onSubmit={(e: FormEvent) => { e.preventDefault(); goNext(); }}>
        {step === 1 && (<section className="rounded-xl border border-[#DDE3E8] bg-white"><div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">{t("newDeal.businessInfoTitle")}</h2><p className="mt-1 text-xs text-[#667085]">{t("newDeal.businessInfoDesc")}</p></div><div className="grid gap-5 p-5 md:grid-cols-2">
          <Field id="legalName" label={t("newDeal.legalName")} required><Input id="legalName" value={business.legalName} onChange={(e) => updateBusiness("legalName", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <Field id="dbaName" label={t("newDeal.dbaName")}><Input id="dbaName" value={business.dbaName} onChange={(e) => updateBusiness("dbaName", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <Field id="requestedAmount" label={t("newDeal.requestedAmount")} required><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-[#667085]">$</span><Input id="requestedAmount" type="number" min="1" value={business.requestedAmount || ""} onChange={(e) => updateBusiness("requestedAmount", Number(e.target.value))} className="rounded-lg border-[#DDE3E8] pl-7 focus-visible:ring-[#4AB547]" /></div></Field>
          <Field id="industry" label={t("newDeal.industry")} required><Select value={business.industry} onValueChange={(v) => updateBusiness("industry", v)}><SelectTrigger id="industry" className="rounded-lg border-[#DDE3E8]"><SelectValue placeholder={t("newDeal.selectIndustry")} /></SelectTrigger><SelectContent>{industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></Field>
          <Field id="state" label={t("newDeal.state")} required><Select value={business.state} onValueChange={(v) => updateBusiness("state", v)}><SelectTrigger id="state" className="rounded-lg border-[#DDE3E8]"><SelectValue placeholder={t("newDeal.selectState")} /></SelectTrigger><SelectContent>{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></Field>
          <Field id="startDate" label={t("newDeal.startDate")}><Input id="startDate" type="date" value={business.startDate} onChange={(e) => updateBusiness("startDate", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <Field id="contactName" label={t("newDeal.contactName")} required><Input id="contactName" value={business.contact.name} onChange={(e) => updateContact("name", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <Field id="email" label={t("newDeal.email")} required><Input id="email" type="email" value={business.contact.email} onChange={(e) => updateContact("email", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <Field id="phone" label={t("newDeal.phone")}><Input id="phone" type="tel" value={business.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
          <div className="md:col-span-2"><Field id="notes" label={t("newDeal.notes")}><Textarea id="notes" value={business.notes} onChange={(e) => updateBusiness("notes", e.target.value)} placeholder={t("newDeal.notesPlaceholder")} className="min-h-24 rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field></div>
        </div></section>) }
        {step === 2 && (<section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><div className="mb-5 rounded-lg border border-green-200 bg-[#F0FAF0] p-4 text-sm leading-relaxed text-[#286C2A]"><strong>{t("newDeal.uploadBest")}</strong> {t("newDeal.uploadBestDesc")}</div><FileUploader documents={documents} onFiles={(files) => setDocuments((c) => [...c, ...filesToDocuments(files)])} onError={setError} /><DocumentList documents={documents} onCategoryChange={(id, cat) => setDocuments((c) => c.map((d) => d.id === id ? { ...d, category: cat, ...(cat !== "Bank statement" ? { statementMonth: undefined, statementYear: undefined, period: undefined } : {}) } : d))} onPeriodChange={updateDocumentPeriod} onRemove={(id) => setDocuments((c) => c.filter((d) => d.id !== id))} />{statementWarnings.length > 0 && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h3 className="text-sm font-extrabold text-amber-900">{t("bankStatements.reviewTitle")}</h3><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{statementWarnings.map((w) => <li key={w}>{w}</li>)}</ul></div></div></div>}</section>) }
        {step === 3 && (<div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]"><section className="rounded-xl border border-[#DDE3E8] bg-white"><div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">{t("newDeal.businessSummary")}</h2></div><dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">{[[t("newDeal.legalName"), business.legalName], [t("dealDetails.dba"), business.dbaName || t("common.dash")], [t("dealDetails.requestedAmount"), formatCurrency(business.requestedAmount)], [t("dealDetails.industry"), business.industry], [t("dealDetails.state"), business.state], [t("dealDetails.contact"), business.contact.name], [t("dealDetails.email"), business.contact.email], [t("newDeal.uploadedDocs"), documents.length + " " + t("common.files")]].map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{label}</dt><dd className="mt-1 text-sm font-bold text-[#16365D]">{value}</dd></div>)}</dl></section><div className="space-y-5"><section className="rounded-xl border border-[#DDE3E8] bg-white p-5"><h2 className="font-extrabold text-[#16365D]">{t("newDeal.docChecklist")}</h2><div className="mt-4 space-y-3">{[[t("newDeal.docLoanApp"), categoryCount("Business loan application")], [t("newDeal.docBankStmts"), categoryCount("Bank statement")], [t("newDeal.docTaxReturns"), categoryCount("Tax return")], [t("newDeal.docFinancials"), categoryCount("Profit and loss statement") + categoryCount("Balance sheet")], [t("newDeal.docSupporting"), documents.length - categoryCount("Business loan application") - categoryCount("Bank statement") - categoryCount("Tax return") - categoryCount("Profit and loss statement") - categoryCount("Balance sheet")]].map(([label, count]) => <div key={String(label)} className="flex items-center justify-between border-b border-[#EEF1F3] pb-2 text-sm last:border-0"><span className="text-[#667085]">{label}</span><span className={cn("font-extrabold", Number(count) > 0 ? "text-[#3A9738]" : "text-[#98A2B3]")}>{count}</span></div>)}</div></section>{(missingItems.length > 0 || statementWarnings.length > 0) && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-extrabold text-amber-900">{t("newDeal.missingDocs")}</h2><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{[...missingItems, ...statementWarnings].map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-xs text-amber-700">{t("newDeal.canStillRun")}</p></div></div></section>}<section className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm leading-relaxed text-blue-900">{t("newDeal.sampleNotice")}</section></div></div>) }
        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#DDE3E8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>{step > 1 && <Button type="button" variant="outline" onClick={() => setStep((c) => c - 1)} className="w-full rounded-lg border-[#C9D2DA] sm:w-auto"><ChevronLeft className="mr-2 h-4 w-4" />{t("common.back")}</Button>}</div>
          {step < 3 ? <Button type="submit" className="rounded-lg bg-[#16365D] font-bold text-white hover:bg-[#102B4B]">{t("common.continue")}<ChevronRight className="ml-2 h-4 w-4" /></Button> : (<div className="flex flex-col gap-2 sm:flex-row"><Button type="button" variant="outline" onClick={saveDraft} className="rounded-lg border-[#BFC9D2] font-bold text-[#16365D]"><Save className="mr-2 h-4 w-4" />{t("newDeal.saveDraft")}</Button><Button type="button" onClick={runAnalysis} className="rounded-lg bg-[#4AB547] font-bold text-white hover:bg-[#3FA33D]"><Sparkles className="mr-2 h-4 w-4" />{t("newDeal.runAnalysis")}</Button></div>) }
        </div>
      </form>
    </>
  );
};

export default NewDeal;