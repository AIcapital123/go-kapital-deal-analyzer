import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import { filesToDocuments } from "@/services/documentStorage";
import { dealStorage } from "@/services/dealStorage";
import { analyzeDeal } from "@/services/analysisService";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Business, Deal, DocumentCategory } from "@/types/deal";

const industries = ["Construction", "Healthcare", "Medical supplies", "Professional services", "Restaurant", "Retail", "Transportation", "Wholesale / distribution", "Other"];
const states = ["CA", "FL", "GA", "IL", "NJ", "NY", "NC", "PA", "SC", "TX", "VA", "Other"];

const initialBusiness: Business = {
  legalName: "",
  dbaName: "",
  requestedAmount: 0,
  industry: "",
  state: "",
  startDate: "",
  contact: { name: "", email: "", phone: "" },
  notes: "",
};

const steps = [
  { number: 1, title: "Business Information", icon: Building2 },
  { number: 2, title: "Upload Documents", icon: Files },
  { number: 3, title: "Review and Analyze", icon: FileCheck2 },
];

const Field = ({ id, label, required, children }: { id: string; label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <Label htmlFor={id} className="text-sm font-bold text-[#344054]">{label}{required && <span className="ml-1 text-red-600">*</span>}</Label>
    {children}
  </div>
);

const NewDeal = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState(initialBusiness);
  const [documents, setDocuments] = useState<Deal["documents"]>([]);
  const [error, setError] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const updateBusiness = <K extends keyof Business>(key: K, value: Business[K]) => setBusiness((current) => ({ ...current, [key]: value }));
  const updateContact = (key: keyof Business["contact"], value: string) => setBusiness((current) => ({ ...current, contact: { ...current.contact, [key]: value } }));

  const validateBusiness = () => {
    if (!business.legalName.trim() || !business.requestedAmount || !business.industry || !business.state || !business.contact.name.trim() || !business.contact.email.trim()) {
      setError("Complete all required business and contact fields before continuing.");
      return false;
    }
    if (!/^\S+@\S+\.\S+$/.test(business.contact.email)) {
      setError("Enter a valid email address for the primary contact.");
      return false;
    }
    setError("");
    return true;
  };

  const goNext = () => {
    if (step === 1 && !validateBusiness()) return;
    setError("");
    setStep((current) => Math.min(3, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryCount = (category: DocumentCategory) => documents.filter((document) => document.category === category).length;
  const missingItems = useMemo(() => {
    const missing: string[] = [];
    if (!categoryCount("Business loan application")) missing.push("Completed business loan application");
    if (categoryCount("Bank statement") < 4) missing.push(`${4 - categoryCount("Bank statement")} additional consecutive bank statement month${4 - categoryCount("Bank statement") === 1 ? "" : "s"}`);
    if (!categoryCount("Tax return")) missing.push("Most recent business tax return (recommended)");
    return missing;
  }, [documents]);

  const buildDeal = (status: Deal["status"]): Deal => {
    const now = new Date().toISOString();
    return {
      id: `deal-${Date.now()}`,
      business,
      documents,
      status,
      createdAt: now,
      updatedAt: now,
    };
  };

  const saveDraft = () => {
    const deal = dealStorage.create(buildDeal("draft"));
    toast.success("Draft saved", { description: `${business.legalName || "Untitled deal"} is available on the dashboard.` });
    navigate(`/deals/${deal.id}`);
  };

  const runAnalysis = async () => {
    if (!validateBusiness()) { setStep(1); return; }
    const deal = dealStorage.create(buildDeal("analyzing"));
    setAnalyzing(true);
    try {
      const analysis = await analyzeDeal(deal);
      dealStorage.update(deal.id, { analysis, status: analysis.riskFlags.some((flag) => flag.severity === "High") ? "needs_review" : "completed" });
      toast.success("Prototype analysis complete", { description: "Mock underwriting results are ready for review." });
      navigate(`/deals/${deal.id}?tab=analysis`);
    } catch {
      dealStorage.updateStatus(deal.id, "error");
      setError("The simulated analysis could not be completed. Please try again.");
      setAnalyzing(false);
    }
  };

  if (analyzing) {
    return (
      <>
        <PageHeader title="Analyzing Deal" subtitle={business.legalName} />
        <div className="flex min-h-[520px] flex-col items-center justify-center rounded-xl border border-[#DDE3E8] bg-white p-8 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[#EEF9EE] text-[#3A9738]"><LoaderCircle className="h-10 w-10 animate-spin" /><Sparkles className="absolute -right-1 top-0 h-5 w-5" /></div>
          <h2 className="mt-6 text-xl font-extrabold text-[#16365D]">Reviewing deal information</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-[#667085]">We’re simulating document review, cash-flow calculations, and risk screening. This prototype uses mock results and does not send files to an external service.</p>
          <div className="mt-6 w-full max-w-sm overflow-hidden rounded-full bg-[#E7EBEF]"><div className="h-2 w-4/5 animate-pulse rounded-full bg-[#4AB547]" /></div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="New Deal" subtitle="Create a complete deal file for underwriting review." />

      <div className="mb-6 rounded-xl border border-[#DDE3E8] bg-white p-4 sm:p-5">
        <ol className="grid gap-3 sm:grid-cols-3">
          {steps.map(({ number, title, icon: Icon }, index) => {
            const complete = number < step;
            const active = number === step;
            return (
              <li key={number} className="relative flex items-center gap-3">
                <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-extrabold", complete && "border-[#4AB547] bg-[#4AB547] text-white", active && "border-[#16365D] bg-[#16365D] text-white", !complete && !active && "border-[#DDE3E8] bg-[#F5F7F9] text-[#667085]")}>
                  {complete ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div><p className="text-[11px] font-bold uppercase tracking-wide text-[#98A2B3]">Step {number}</p><p className={cn("text-sm font-bold", active || complete ? "text-[#16365D]" : "text-[#667085]")}>{title}</p></div>
                {index < steps.length - 1 && <div className="absolute left-11 right-0 top-4 -z-10 hidden h-px bg-[#DDE3E8] sm:block" />}
              </li>
            );
          })}
        </ol>
      </div>

      {error && <div className="mb-4"><ErrorMessage message={error} /></div>}

      <form onSubmit={(event: FormEvent) => { event.preventDefault(); goNext(); }}>
        {step === 1 && (
          <section className="rounded-xl border border-[#DDE3E8] bg-white">
            <div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">Business Information</h2><p className="mt-1 text-xs text-[#667085]">Enter the information supplied on the loan application.</p></div>
            <div className="grid gap-5 p-5 md:grid-cols-2">
              <Field id="legalName" label="Legal Business Name" required><Input id="legalName" value={business.legalName} onChange={(event) => updateBusiness("legalName", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <Field id="dbaName" label="DBA Name"><Input id="dbaName" value={business.dbaName} onChange={(event) => updateBusiness("dbaName", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <Field id="requestedAmount" label="Requested Loan Amount" required><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-[#667085]">$</span><Input id="requestedAmount" type="number" min="1" value={business.requestedAmount || ""} onChange={(event) => updateBusiness("requestedAmount", Number(event.target.value))} className="rounded-lg border-[#DDE3E8] pl-7 focus-visible:ring-[#4AB547]" /></div></Field>
              <Field id="industry" label="Industry" required><Select value={business.industry} onValueChange={(value) => updateBusiness("industry", value)}><SelectTrigger id="industry" className="rounded-lg border-[#DDE3E8]"><SelectValue placeholder="Select industry" /></SelectTrigger><SelectContent>{industries.map((industry) => <SelectItem key={industry} value={industry}>{industry}</SelectItem>)}</SelectContent></Select></Field>
              <Field id="state" label="State" required><Select value={business.state} onValueChange={(value) => updateBusiness("state", value)}><SelectTrigger id="state" className="rounded-lg border-[#DDE3E8]"><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{states.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select></Field>
              <Field id="startDate" label="Business Start Date"><Input id="startDate" type="date" value={business.startDate} onChange={(event) => updateBusiness("startDate", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <Field id="contactName" label="Primary Contact Name" required><Input id="contactName" value={business.contact.name} onChange={(event) => updateContact("name", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <Field id="email" label="Email" required><Input id="email" type="email" value={business.contact.email} onChange={(event) => updateContact("email", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <Field id="phone" label="Phone"><Input id="phone" type="tel" value={business.contact.phone} onChange={(event) => updateContact("phone", event.target.value)} className="rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field>
              <div className="md:col-span-2"><Field id="notes" label="Notes"><Textarea id="notes" value={business.notes} onChange={(event) => updateBusiness("notes", event.target.value)} placeholder="Use of funds, deal context, or broker notes" className="min-h-24 rounded-lg border-[#DDE3E8] focus-visible:ring-[#4AB547]" /></Field></div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="rounded-xl border border-[#DDE3E8] bg-white p-5">
            <div className="mb-5 rounded-lg border border-green-200 bg-[#F0FAF0] p-4 text-sm leading-relaxed text-[#286C2A]"><strong>For best results,</strong> upload the completed application and at least four consecutive months of business bank statements.</div>
            <FileUploader onFiles={(files) => { setDocuments((current) => [...current, ...filesToDocuments(files)]); setError(""); }} onError={setError} />
            <DocumentList documents={documents} onCategoryChange={(id, category) => setDocuments((current) => current.map((document) => document.id === id ? { ...document, category } : document))} onRemove={(id) => setDocuments((current) => current.filter((document) => document.id !== id))} />
          </section>
        )}

        {step === 3 && (
          <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <section className="rounded-xl border border-[#DDE3E8] bg-white">
              <div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">Business Summary</h2></div>
              <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
                {[ ["Legal business name", business.legalName], ["DBA", business.dbaName || "—"], ["Requested amount", formatCurrency(business.requestedAmount)], ["Industry", business.industry], ["State", business.state], ["Primary contact", business.contact.name], ["Email", business.contact.email], ["Uploaded documents", `${documents.length} files`] ].map(([label, value]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-[#98A2B3]">{label}</dt><dd className="mt-1 text-sm font-bold text-[#16365D]">{value}</dd></div>)}
              </dl>
            </section>

            <div className="space-y-5">
              <section className="rounded-xl border border-[#DDE3E8] bg-white p-5">
                <h2 className="font-extrabold text-[#16365D]">Document Checklist</h2>
                <div className="mt-4 space-y-3">
                  {[ ["Business loan application", categoryCount("Business loan application")], ["Bank statements", categoryCount("Bank statement")], ["Tax returns", categoryCount("Tax return")], ["Financial statements", categoryCount("Profit and loss statement") + categoryCount("Balance sheet")], ["Supporting documents", documents.length - categoryCount("Business loan application") - categoryCount("Bank statement") - categoryCount("Tax return") - categoryCount("Profit and loss statement") - categoryCount("Balance sheet")] ].map(([label, count]) => <div key={String(label)} className="flex items-center justify-between border-b border-[#EEF1F3] pb-2 text-sm last:border-0"><span className="text-[#667085]">{label}</span><span className={cn("font-extrabold", Number(count) > 0 ? "text-[#3A9738]" : "text-[#98A2B3]")}>{count}</span></div>)}
                </div>
              </section>

              {missingItems.length > 0 && <section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><h2 className="font-extrabold text-amber-900">Missing or recommended documents</h2><ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-amber-800">{missingItems.map((item) => <li key={item}>{item}</li>)}</ul><p className="mt-3 text-xs text-amber-700">You can still run the prototype analysis with incomplete documents.</p></div></div></section>}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-[#DDE3E8] pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div>{step > 1 && <Button type="button" variant="outline" onClick={() => setStep((current) => current - 1)} className="w-full rounded-lg border-[#C9D2DA] sm:w-auto"><ChevronLeft className="mr-2 h-4 w-4" />Back</Button>}</div>
          {step < 3 ? (
            <Button type="submit" className="rounded-lg bg-[#16365D] font-bold text-white hover:bg-[#102B4B]">Continue<ChevronRight className="ml-2 h-4 w-4" /></Button>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" variant="outline" onClick={saveDraft} className="rounded-lg border-[#BFC9D2] font-bold text-[#16365D]"><Save className="mr-2 h-4 w-4" />Save as Draft</Button>
              <Button type="button" onClick={runAnalysis} className="rounded-lg bg-[#4AB547] font-bold text-white hover:bg-[#3FA33D]"><Sparkles className="mr-2 h-4 w-4" />Analyze Deal</Button>
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default NewDeal;
