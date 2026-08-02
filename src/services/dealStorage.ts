import { seedDeals } from "@/data/mockData";
import type { AnalysisResult, AnalystNote, BankStatementMonth, Deal, DealStatus, DocumentProcessingStatus } from "@/types/deal";

const STORAGE_KEY = "gokapital-deal-analyzer-deals-v1";
let recoveryWarning: string | null = null;

const cloneSeedDeals = (): Deal[] => JSON.parse(JSON.stringify(seedDeals)) as Deal[];

const normalizeDeal = (deal: Deal): Deal => {
  const documents = (deal.documents ?? []).map((document) => {
    const storedStatus = document.processingStatus as string | undefined;
    return {
      ...document,
      processingStatus: (storedStatus === "pending" || !storedStatus ? "selected" : storedStatus) as DocumentProcessingStatus,
    };
  });

  if (!deal.analysis) return { ...deal, documents };

  const legacyAnalysis = deal.analysis as AnalysisResult & { prototype?: boolean };
  const bankStatements = (legacyAnalysis.bankStatements ?? []).map((month) => {
    const legacyMonth = month as BankStatementMonth & { totalDeposits?: number };
    const grossDeposits = legacyMonth.grossDeposits ?? legacyMonth.totalDeposits ?? 0;
    return {
      ...legacyMonth,
      grossDeposits,
      transfersExcluded: legacyMonth.transfersExcluded ?? 0,
      loanOrMcaProceedsExcluded: legacyMonth.loanOrMcaProceedsExcluded ?? 0,
      returnedDepositsExcluded: legacyMonth.returnedDepositsExcluded ?? 0,
      otherExclusions: legacyMonth.otherExclusions ?? 0,
      adjustedBusinessRevenue: legacyMonth.adjustedBusinessRevenue ?? grossDeposits,
      beginningBalance: legacyMonth.beginningBalance ?? 0,
    };
  });

  return {
    ...deal,
    documents,
    analysis: {
      ...legacyAnalysis,
      dataSource: legacyAnalysis.dataSource ?? "sample",
      promptVersion: legacyAnalysis.promptVersion ?? "legacy-sample-v1",
      analysisVersion: legacyAnalysis.analysisVersion ?? "legacy-sample-v1",
      documentIds: legacyAnalysis.documentIds ?? documents.map((document) => document.id),
      warnings: legacyAnalysis.warnings ?? ["Sample Analysis only. Uploaded file contents were not reviewed."],
      bankStatements,
    },
  };
};

const isStoredDealArray = (value: unknown): value is Deal[] =>
  Array.isArray(value) && value.every((deal) => {
    if (!deal || typeof deal !== "object") return false;
    const candidate = deal as Record<string, unknown>;
    return typeof candidate.id === "string"
      && Boolean(candidate.business)
      && typeof candidate.business === "object"
      && Array.isArray(candidate.documents)
      && typeof candidate.status === "string"
      && typeof candidate.createdAt === "string";
  });

const write = (deals: Deal[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch {
    recoveryWarning = "Changes could not be saved in this browser. Prototype data is still available for this session.";
  }
};

const restoreSeedData = () => {
  const restored = cloneSeedDeals();
  write(restored);
  return restored;
};

const read = (): Deal[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return restoreSeedData();

    const parsed: unknown = JSON.parse(stored);
    if (!isStoredDealArray(parsed)) throw new Error("Invalid prototype data format");

    const normalized = parsed.map(normalizeDeal);
    if (JSON.stringify(normalized) !== stored) write(normalized);
    return normalized;
  } catch {
    recoveryWarning = "Saved prototype data couldn’t be read, so the original sample deals were restored.";
    return restoreSeedData();
  }
};

// Prototype browser storage. Replace with Supabase database queries and Supabase Authentication scoping.
export const dealStorage = {
  getAll: () => [...read()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  getById: (id: string) => read().find((deal) => deal.id === id),
  create: (deal: Deal) => {
    write([deal, ...read()]);
    return deal;
  },
  update: (id: string, updates: Partial<Deal>) => {
    const deals = read();
    const updated = deals.map((deal) =>
      deal.id === id ? { ...deal, ...updates, updatedAt: new Date().toISOString() } : deal,
    );
    write(updated);
    return updated.find((deal) => deal.id === id);
  },
  updateStatus: (id: string, status: DealStatus) =>
    dealStorage.update(id, { status }),
  saveNote: (dealId: string, content: string) => {
    const note: AnalystNote = {
      id: `note-${dealId}`,
      dealId,
      content,
      updatedAt: new Date().toISOString(),
    };
    return dealStorage.update(dealId, { analystNote: note });
  },
  reset: () => restoreSeedData(),
  consumeRecoveryWarning: () => {
    const warning = recoveryWarning;
    recoveryWarning = null;
    return warning;
  },
};
