export type DealStatus =
  | "draft"
  | "ready"
  | "analyzing"
  | "completed"
  | "needs_review"
  | "error";

export type DocumentCategory =
  | "Business loan application"
  | "Bank statement"
  | "Tax return"
  | "Profit and loss statement"
  | "Balance sheet"
  | "Driver’s license"
  | "Voided check"
  | "Other supporting document";

export type DocumentProcessingStatus =
  | "selected"
  | "uploading"
  | "uploaded"
  | "extracting"
  | "processed"
  | "needs_review"
  | "failed";

export interface SourceEvidence {
  documentId: string;
  documentName: string;
  pageNumber: number;
  evidenceText: string;
  confidence: number;
  extractionMethod: "direct" | "calculated" | "inferred";
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

export interface Business {
  legalName: string;
  dbaName: string;
  industry: string;
  state: string;
  startDate: string;
  requestedAmount: number;
  contact: Contact;
  notes: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  category: DocumentCategory;
  size: number;
  period?: string;
  statementMonth?: number;
  statementYear?: number;
  storagePath?: string;
  pageCount?: number;
  extractionConfidence?: number;
  extractionError?: string;
  uploadDate: string;
  uploadStatus: "uploaded" | "ready" | "error";
  processingStatus: DocumentProcessingStatus;
}

export interface BankStatementMonth {
  month: string;
  grossDeposits: number;
  transfersExcluded: number;
  loanOrMcaProceedsExcluded: number;
  returnedDepositsExcluded: number;
  otherExclusions: number;
  adjustedBusinessRevenue: number;
  averageDailyBalance: number;
  beginningBalance: number;
  endingBalance: number;
  numberOfDeposits: number;
  negativeBalanceDays: number;
  nsfCount: number;
  sourceEvidence?: SourceEvidence[];
}

export interface ExistingLoan {
  lender: string;
  accountName: string;
  fundingDate: string;
  originalAmount: number;
  observedDebit: number;
  frequency: "Daily" | "Weekly" | "Monthly";
  estimatedMonthlyPayment: number;
  status: "Active" | "Likely active" | "Paid off";
  sourceEvidence?: SourceEvidence[];
}

export interface RecentFundingActivity {
  funder: string;
  depositDate: string;
  depositAmount: number;
  observedDebit: number;
  frequency: string;
  sourceDocument: string;
  sourceEvidence?: SourceEvidence[];
}

export interface TaxReturnSummary {
  taxYear: number;
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  sourceEvidence?: SourceEvidence[];
}

export interface RiskFlag {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  sourceDocument: string;
  recommendation: string;
  sourceEvidence?: SourceEvidence[];
}

export interface AnalysisMetricEvidence {
  estimatedMonthlyRevenue?: SourceEvidence[];
  existingFinancingPositions?: SourceEvidence[];
  cashFlowObservation?: SourceEvidence[];
}

export interface AnalysisResult {
  generatedAt: string;
  dataSource: "sample" | "gemini";
  model?: string;
  promptVersion: string;
  analysisVersion: string;
  documentIds: string[];
  warnings: string[];
  overallConfidence?: number;
  estimatedMonthlyRevenue: number;
  existingFinancingPositions: number;
  cashFlowObservation: string;
  summary: string;
  bankStatements: BankStatementMonth[];
  existingLoans: ExistingLoan[];
  recentFunding: RecentFundingActivity[];
  taxReturns: TaxReturnSummary[];
  revenueChange: number;
  taxBankInconsistency: string;
  riskFlags: RiskFlag[];
  metricEvidence?: AnalysisMetricEvidence;
}

export interface AnalystNote {
  id: string;
  dealId: string;
  content: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  business: Business;
  documents: Document[];
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  analysis?: AnalysisResult;
  analystNote?: AnalystNote;
}
