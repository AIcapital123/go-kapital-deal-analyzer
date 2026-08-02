import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, ExternalLink, Lock, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { ExtractedField, ProfileConflict, PublicResearchSource } from "@/types/deal";

export type VisualState = "green" | "amber" | "gray" | "blue";

export const fieldVisualState = (field: ExtractedField<string | number>): VisualState => {
  if (field.reviewStatus === "user_confirmed") return "green";
  if (field.reviewStatus === "publicly_corroborated") return "blue";
  if (field.reviewStatus === "not_found") return "gray";
  if (field.reviewStatus === "conflicting" || field.reviewStatus === "low_confidence") return "amber";
  return field.confidence >= 0.85 ? "green" : "amber";
};

export const visualStyles: Record<VisualState, { border: string; bg: string; text: string; badge: string; dot: string }> = {
  green: { border: "border-green-200", bg: "bg-green-50", text: "text-green-800", badge: "bg-green-100 text-green-700", dot: "bg-green-500" },
  amber: { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-800", badge: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  gray: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-600", badge: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  blue: { border: "border-blue-200", bg: "bg-blue-50", text: "text-blue-800", badge: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
};

export const SampleNotice = () => {
  const { t } = useTranslation();
  return <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">{t("underwriterHelpers.prototypeMode")}</div>;
};

export const LendingSafeguard = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 rounded-lg border-l-4 border-amber-500 bg-amber-50 p-4"><Scale className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><p className="text-sm leading-relaxed text-amber-900">{t("underwriterHelpers.lendingNotice")}</p></div>
  );
};

export const DisabledFutureButton = ({ label }: { label: string }) => (
  <Button disabled variant="outline" className="cursor-not-allowed rounded-lg border-[#DDE3E8] opacity-60"><Lock className="mr-2 h-4 w-4" />{label}</Button>
);

export const SourceBadge = ({ field }: { field: ExtractedField<string | number> }) => {
  const { t } = useTranslation();
  const state = fieldVisualState(field);
  const styles = visualStyles[state];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold", styles.badge)}><span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />{t("underwriterHelpers." + state)}</span>
  );
};

export const ExtractedFieldRow = ({ label, field }: { label: string; field: ExtractedField<string | number> }) => {
  const { t } = useTranslation();
  const state = fieldVisualState(field);
  const styles = visualStyles[state];
  return (
    <div className={cn("rounded-lg border p-4", styles.border, styles.bg)}><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-[#667085]">{label}</p><p className={cn("mt-1 text-sm font-bold", styles.text)}>{field.reviewStatus === "not_found" ? t("underwriterHelpers.notFoundInDocs") : field.value || t("underwriterHelpers.notFoundInDocs")}</p>{field.reviewStatus !== "not_found" && <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#667085]"><span>{t("underwriterHelpers.source")}: <strong className="capitalize">{field.source.replace(/_/g, " ")}</strong></span>{field.sourceDocumentName && <span>{t("underwriterHelpers.doc")}: {field.sourceDocumentName}{field.pageNumber ? " p." + field.pageNumber : ""}</span>}<span>{t("underwriterHelpers.confidence")}: {Math.round(field.confidence * 100)}%</span></div>}</div><SourceBadge field={field} /></div></div>
  );
};

export const ResearchSourceCard = ({ source }: { source: PublicResearchSource }) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-[#DDE3E8] bg-white p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><a href={source.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-[#1B7AC4] hover:underline">{source.title}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a><p className="mt-0.5 text-xs font-semibold text-[#667085]">{source.publisher}</p></div><span className="shrink-0 rounded-full bg-[#EEF3F8] px-2 py-0.5 text-[11px] font-bold text-[#16365D]">{source.sourceCategory}</span></div><p className="mt-2 text-xs leading-relaxed text-[#344054]">{source.supportingText}</p><div className="mt-2 flex items-center gap-3 text-xs text-[#667085]"><span>{t("underwriterHelpers.matchConfidence")}: <strong>{Math.round(source.matchConfidence * 100)}%</strong></span><span>{t("underwriterHelpers.accessed")}: {formatDate(source.retrievedAt)}</span></div></div>
  );
};

export const ProfileReviewField = ({ label, field, onEdit, onConfirm }: { label: string; field: ExtractedField<string | number>; onEdit: (value: string) => void; onConfirm: () => void }) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(field.value));
  const state = fieldVisualState(field);
  const styles = visualStyles[state];
  return (
    <div className={cn("rounded-lg border p-4", styles.border)}><div className="flex items-start justify-between gap-2"><p className="text-xs font-bold uppercase tracking-wide text-[#667085]">{label}</p><SourceBadge field={field} /></div>{!editing ? (<p className={cn("mt-1 text-sm font-bold", field.reviewStatus === "not_found" ? "text-[#98A2B3]" : "text-[#16365D]")}>{field.reviewStatus === "not_found" ? t("underwriterHelpers.notFoundInDocs") : field.value || t("underwriterHelpers.notFoundInDocs")}</p>) : (<div className="mt-2 flex gap-2"><Input value={draft} onChange={(e) => setDraft(e.target.value)} className="h-8 rounded-lg border-[#DDE3E8] text-sm" autoFocus /><Button size="sm" onClick={() => { onEdit(draft); setEditing(false); }} className="rounded-lg bg-[#4AB547] hover:bg-[#3FA33D]">{t("underwriterHelpers.save")}</Button></div>)}{field.reviewStatus !== "not_found" && !editing && (<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#667085]"><span>{t("underwriterHelpers.source")}: <strong className="capitalize">{field.source.replace(/_/g, " ")}</strong></span><span>{t("underwriterHelpers.confidence")}: {Math.round(field.confidence * 100)}%</span></div>)}{!editing && (<div className="mt-2 flex gap-2"><button type="button" onClick={() => { setDraft(String(field.value)); setEditing(true); }} className="text-xs font-bold text-[#1B7AC4] hover:underline">{t("underwriterHelpers.edit")}</button>{field.reviewStatus !== "user_confirmed" && <button type="button" onClick={onConfirm} className="text-xs font-bold text-[#3A9738] hover:underline">{t("underwriterHelpers.markConfirmed")}</button>}</div>)}</div>
  );
};

export const ConflictResolver = ({ conflict, onResolve }: { conflict: ProfileConflict; onResolve: (resolution: ProfileConflict["resolution"], value?: string) => void }) => {
  const { t } = useTranslation();
  const [manualValue, setManualValue] = useState("");
  const [showManual, setShowManual] = useState(false);
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4"><div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-600" /><h4 className="text-sm font-extrabold text-amber-900">{conflict.fieldLabel}</h4></div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg border border-[#DDE3E8] bg-white p-3"><p className="text-[11px] font-bold uppercase text-[#667085]">{t("underwriterHelpers.appValue")}</p><p className="mt-1 text-sm font-bold text-[#16365D]">{conflict.applicationValue}</p><p className="mt-1 text-xs text-[#667085]">{conflict.applicationSource}</p><button type="button" onClick={() => onResolve("application", conflict.applicationValue)} className={cn("mt-2 rounded-lg px-3 py-1 text-xs font-bold transition", conflict.resolution === "application" ? "bg-[#4AB547] text-white" : "border border-[#DDE3E8] text-[#16365D] hover:bg-slate-50")}>{conflict.resolution === "application" ? t("underwriterHelpers.accepted") : t("underwriterHelpers.acceptApp")}</button></div><div className="rounded-lg border border-[#DDE3E8] bg-white p-3"><p className="text-[11px] font-bold uppercase text-[#667085]">{t("underwriterHelpers.publicValue")}</p><p className="mt-1 text-sm font-bold text-[#1B7AC4]">{conflict.publicValue}</p><p className="mt-1 text-xs text-[#667085]">{conflict.publicSource}</p><button type="button" onClick={() => onResolve("public", conflict.publicValue)} className={cn("mt-2 rounded-lg px-3 py-1 text-xs font-bold transition", conflict.resolution === "public" ? "bg-[#1B7AC4] text-white" : "border border-[#DDE3E8] text-[#16365D] hover:bg-slate-50")}>{conflict.resolution === "public" ? t("underwriterHelpers.accepted") : t("underwriterHelpers.acceptPublic")}</button></div></div>{showManual ? (<div className="mt-3 flex gap-2"><Input value={manualValue} onChange={(e) => setManualValue(e.target.value)} placeholder={t("underwriterHelpers.enterValue")} className="h-9 rounded-lg border-[#DDE3E8] text-sm" /><Button size="sm" onClick={() => manualValue && onResolve("manual", manualValue)} className="rounded-lg bg-[#16365D] hover:bg-[#102B4B]">{t("underwriterHelpers.apply")}</Button></div>) : (<button type="button" onClick={() => setShowManual(true)} className="mt-2 text-xs font-bold text-[#667085] hover:underline">{t("underwriterHelpers.enterManual")}</button>)}</div>
  );
};

export const SectionCard = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <section className="overflow-hidden rounded-xl border border-[#DDE3E8] bg-white"><div className="border-b border-[#E7EBEF] px-5 py-4"><h2 className="font-extrabold text-[#16365D]">{title}</h2>{description && <p className="mt-1 text-xs text-[#667085]">{description}</p>}</div><div className="p-5">{children}</div></section>
);