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
  uploadDate: string;
  uploadStatus: "uploaded" | "ready" | "error";
  processingStatus: "pending" | "processed" | "needs_review";
}

export interface BankStatementMonth {
  month: string;
  totalDeposits: number;
  averageDailyBalance: number;
  numberOfDeposits: number;
  negativeBalanceDays: number;
  endingBalance: number;
  nsfCount: number;
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
}

export interface RecentFundingActivity {
  funder: string;
  depositDate: string;
  depositAmount: number;
  observedDebit: number;
  frequency: string;
  sourceDocument: string;
}

export interface TaxReturnSummary {
  taxYear: number;
  grossRevenue: number;
  costOfGoodsSold: number;
  grossProfit: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
}

export interface RiskFlag {
  id: string;
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
  sourceDocument: string;
  recommendation: string;
}

export interface AnalysisResult {
  generatedAt: string;
  prototype: true;
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
