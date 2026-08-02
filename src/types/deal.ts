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

export type EntryMode = "manual" | "automated";

export type ExtractionSourceType =
  | "user_manual"
  | "loan_application"
  | "bank_statement"
  | "tax_return"
  | "financial_statement"
  | "public_record"
  | "business_website"
  | "ai_inference";

export type ReviewStatus =
  | "found"
  | "not_found"
  | "low_confidence"
  | "conflicting"
  | "publicly_corroborated"
  | "user_confirmed";

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface ExtractedField<T = string> {
  value: T;
  source: ExtractionSourceType;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  pageNumber?: number;
  confidence: number;
  reviewStatus: ReviewStatus;
  userEdited: boolean;
  alternatives?: ExtractedFieldAlternative<T>[];
}

export interface ExtractedFieldAlternative<T = string> {
  value: T;
  source: ExtractionSourceType;
  sourceDocumentId?: string;
  sourceDocumentName?: string;
  confidence: number;
}

export interface ExtractedBusinessProfile {
  legalBusinessName: ExtractedField<string>;
  dbaName: ExtractedField<string>;
  ownerName: ExtractedField<string>;
  businessAddress: ExtractedField<string>;
  email: ExtractedField<string>;
  phone: ExtractedField<string>;
  industry: ExtractedField<string>;
  businessStartDate: ExtractedField<string>;
  timeInBusiness: ExtractedField<string>;
  requestedLoanAmount: ExtractedField<number>;
  useOfFunds: ExtractedField<string>;
  ownershipInfo: ExtractedField<string>;
  einLastFour: ExtractedField<string>;
}

export interface PublicResearchSource {
  title: string;
  publisher: string;
  url: string;
  retrievedAt: string;
  supportingText: string;
  sourceCategory: string;
  matchConfidence: number;
}

export interface PublicBusinessProfile {
  legalBusinessName: ExtractedField<string>;
  dbaName: ExtractedField<string>;
  businessAddress: ExtractedField<string>;
  website: ExtractedField<string>;
  phone: ExtractedField<string>;
  email: ExtractedField<string>;
  industry: ExtractedField<string>;
  formationDate: ExtractedField<string>;
  entityType: ExtractedField<string>;
  registrationStatus: ExtractedField<string>;
  description: ExtractedField<string>;
  locations: ExtractedField<string>;
  sources: PublicResearchSource[];
}

export interface ProfileConflict {
  fieldKey: string;
  fieldLabel: string;
  applicationValue: string;
  publicValue: string;
  applicationSource: string;
  publicSource: string;
  resolution: "application" | "public" | "manual" | null;
  resolvedValue?: string;
}

export interface MissingProfileField {
  fieldKey: string;
  fieldLabel: string;
  required: boolean;
}

export interface ProfileExtractionResult {
  businessProfile: ExtractedBusinessProfile;
  conflicts: ProfileConflict[];
  missingFields: MissingProfileField[];
  generatedAt: string;
  dataSource: "sample" | "ai";
  warnings: string[];
}

export interface PublicResearchResult {
  profile: PublicBusinessProfile | null;
  conflicts: ProfileConflict[];
  generatedAt: string;
  dataSource: "sample" | "ai";
  warnings: string[];
}

export interface UnderwritingSummary {
  businessProfile: ExtractedBusinessProfile;
  publicResearch: PublicResearchResult | null;
  bankStatements: BankStatementMonth[];
  existingLoans: ExistingLoan[];
  recentFunding: RecentFundingActivity[];
  taxReturns: TaxReturnSummary[];
  riskFlags: RiskFlag[];
  missingInfo: MissingProfileField[];
  analystNotes: string;
  generatedAt: string;
  dataSource: "sample" | "ai";
  warnings: string[];
  averageMonthlyGrossDeposits: number;
  averageMonthlyAdjustedRevenue: number;
  averageDailyBalance: number;
  revenueTrend: string;
  totalNegativeDays: number;
  totalNsfEvents: number;
  estimatedMonthlyFinancingPayments: number;
}

export interface Deal {
  id: string;
  business: Business;
  documents: Document[];
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
  entryMode?: EntryMode;
  extractionResult?: ProfileExtractionResult;
  publicResearchResult?: PublicResearchResult;
  analysis?: AnalysisResult;
  analystNote?: AnalystNote;
}
