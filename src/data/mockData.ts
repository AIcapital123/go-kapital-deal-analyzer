import type { AnalysisResult, Deal, Document, SourceEvidence } from "@/types/deal";

const evidence = (
  documentId: string,
  documentName: string,
  pageNumber: number,
  evidenceText: string,
  confidence: number,
  extractionMethod: SourceEvidence["extractionMethod"],
): SourceEvidence => ({ documentId, documentName, pageNumber, evidenceText, confidence, extractionMethod });

const processedDocuments: Document[] = [
  { id: "doc-1", name: "GoKapital_Application.pdf", type: "PDF", category: "Business loan application", size: 842000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 6, extractionConfidence: 0.96 },
  { id: "doc-2", name: "May_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "May 2025", statementMonth: 5, statementYear: 2025, size: 1240000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 12, extractionConfidence: 0.93 },
  { id: "doc-3", name: "April_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "April 2025", statementMonth: 4, statementYear: 2025, size: 1180000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 11, extractionConfidence: 0.94 },
  { id: "doc-4", name: "March_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "March 2025", statementMonth: 3, statementYear: 2025, size: 1090000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 10, extractionConfidence: 0.95 },
  { id: "doc-5", name: "February_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "February 2025", statementMonth: 2, statementYear: 2025, size: 1310000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 13, extractionConfidence: 0.94 },
  { id: "doc-6", name: "2024_Business_Tax_Return.pdf", type: "PDF", category: "Tax return", period: "2024", size: 2480000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed", pageCount: 28, extractionConfidence: 0.91 },
];

const mayEvidence = evidence("doc-2", "May_2025_Bank_Statement.pdf", 2, "Total credits $172,400.00; identified transfers and returned deposits are excluded from operating revenue.", 0.93, "calculated");
const loanEvidence = evidence("doc-3", "April_2025_Bank_Statement.pdf", 4, "Recurring weekday ACH debit: FWD CAP ACH $585.00.", 0.96, "direct");
const taxEvidence = evidence("doc-6", "2024_Business_Tax_Return.pdf", 1, "Form 1120-S Line 1a gross receipts or sales: $2,184,000.", 0.98, "direct");

export const mockAnalysis: AnalysisResult = {
  generatedAt: "2025-06-14T16:24:00.000Z",
  dataSource: "sample",
  model: "sample-ruleset",
  promptVersion: "sample-prompt-v1",
  analysisVersion: "2025.06-sample",
  documentIds: processedDocuments.map((document) => document.id),
  warnings: [
    "Sample Analysis only. Uploaded file contents were not reviewed.",
    "Exclusion classifications require manual verification before underwriting use.",
  ],
  overallConfidence: 0.87,
  estimatedMonthlyRevenue: 173338,
  existingFinancingPositions: 2,
  cashFlowObservation: "Adjusted business revenue remains positive, but balances tightened in the two most recent months while daily debt service remained elevated.",
  summary: "Sample Analysis: Sunrise Medical Supply LLC is an established healthcare distributor requesting working capital to expand inventory. Adjusted deposit volume appears supportive, subject to manual verification of exclusions, existing daily obligations, and recent balance compression.",
  bankStatements: [
    { month: "May 2025", grossDeposits: 172400, transfersExcluded: 8400, loanOrMcaProceedsExcluded: 0, returnedDepositsExcluded: 1900, otherExclusions: 650, adjustedBusinessRevenue: 161450, averageDailyBalance: 12840, beginningBalance: 12110, endingBalance: 8240, numberOfDeposits: 38, negativeBalanceDays: 3, nsfCount: 2, sourceEvidence: [mayEvidence] },
    { month: "April 2025", grossDeposits: 179800, transfersExcluded: 7200, loanOrMcaProceedsExcluded: 0, returnedDepositsExcluded: 2450, otherExclusions: 1250, adjustedBusinessRevenue: 168900, averageDailyBalance: 14620, beginningBalance: 19480, endingBalance: 12110, numberOfDeposits: 41, negativeBalanceDays: 1, nsfCount: 1, sourceEvidence: [evidence("doc-3", "April_2025_Bank_Statement.pdf", 2, "Gross credits of $179,800 less $10,900 in identified non-operating deposits.", 0.92, "calculated")] },
    { month: "March 2025", grossDeposits: 191300, transfersExcluded: 9600, loanOrMcaProceedsExcluded: 0, returnedDepositsExcluded: 0, otherExclusions: 2000, adjustedBusinessRevenue: 179700, averageDailyBalance: 18320, beginningBalance: 22160, endingBalance: 19480, numberOfDeposits: 43, negativeBalanceDays: 0, nsfCount: 0, sourceEvidence: [evidence("doc-4", "March_2025_Bank_Statement.pdf", 2, "Adjusted business revenue calculated from monthly credits after transfer exclusions.", 0.91, "calculated")] },
    { month: "February 2025", grossDeposits: 195500, transfersExcluded: 10100, loanOrMcaProceedsExcluded: 0, returnedDepositsExcluded: 1100, otherExclusions: 1000, adjustedBusinessRevenue: 183300, averageDailyBalance: 20140, beginningBalance: 20740, endingBalance: 22160, numberOfDeposits: 46, negativeBalanceDays: 0, nsfCount: 0, sourceEvidence: [evidence("doc-5", "February_2025_Bank_Statement.pdf", 2, "Adjusted business revenue calculated from monthly credits after identified exclusions.", 0.92, "calculated")] },
  ],
  existingLoans: [
    { lender: "Forward Capital", accountName: "FWD CAP ACH", fundingDate: "2025-01-17", originalAmount: 85000, observedDebit: 585, frequency: "Daily", estimatedMonthlyPayment: 12870, status: "Active", sourceEvidence: [loanEvidence] },
    { lender: "Metro Equipment Finance", accountName: "METRO EQUIP", fundingDate: "2024-08-09", originalAmount: 48000, observedDebit: 2140, frequency: "Monthly", estimatedMonthlyPayment: 2140, status: "Likely active", sourceEvidence: [evidence("doc-2", "May_2025_Bank_Statement.pdf", 7, "Monthly ACH debit METRO EQUIP $2,140.00.", 0.94, "direct")] },
  ],
  recentFunding: [
    { funder: "Forward Capital", depositDate: "Jan 17, 2025", depositAmount: 82025, observedDebit: 585, frequency: "Weekdays", sourceDocument: "January 2025 statement", sourceEvidence: [loanEvidence] },
    { funder: "Metro Equipment Finance", depositDate: "Aug 9, 2024", depositAmount: 48000, observedDebit: 2140, frequency: "Monthly", sourceDocument: "Application / April statement" },
  ],
  taxReturns: [
    { taxYear: 2024, grossRevenue: 2184000, costOfGoodsSold: 1420000, grossProfit: 764000, netIncome: 186000, totalAssets: 648000, totalLiabilities: 391000, sourceEvidence: [taxEvidence] },
    { taxYear: 2023, grossRevenue: 1965000, costOfGoodsSold: 1284000, grossProfit: 681000, netIncome: 159000, totalAssets: 582000, totalLiabilities: 356000, sourceEvidence: [evidence("doc-6", "2024_Business_Tax_Return.pdf", 22, "Prior-year comparative values shown in the sample tax summary schedule.", 0.82, "inferred")] },
  ],
  revenueChange: 11.1,
  taxBankInconsistency: "Annualized sample adjusted bank revenue is approximately 4.8% below reported 2024 gross revenue. Manual reconciliation is recommended.",
  riskFlags: [
    { id: "risk-1", title: "Declining adjusted revenue trend", severity: "Medium", explanation: "Adjusted business revenue declined 11.9% from February through May in this sample result.", sourceDocument: "February–May 2025 bank statements", recommendation: "Confirm whether the decline is seasonal and request June month-to-date activity.", sourceEvidence: [mayEvidence] },
    { id: "risk-2", title: "Existing daily MCA payments", severity: "High", explanation: "Weekday debits of approximately $585 indicate a likely active merchant cash advance.", sourceDocument: "April and May 2025 bank statements", recommendation: "Obtain a current payoff letter and include the obligation in global cash-flow analysis.", sourceEvidence: [loanEvidence] },
    { id: "risk-3", title: "Recent NSF activity", severity: "Medium", explanation: "Three NSF or overdraft events were represented in the last two sample months.", sourceDocument: "April and May 2025 bank statements", recommendation: "Review transaction detail and confirm all items were cured.", sourceEvidence: [evidence("doc-2", "May_2025_Bank_Statement.pdf", 9, "Two overdraft fees shown in the account fee summary.", 0.95, "direct")] },
  ],
  metricEvidence: {
    estimatedMonthlyRevenue: [mayEvidence],
    existingFinancingPositions: [loanEvidence],
    cashFlowObservation: [mayEvidence, loanEvidence],
  },
};

export const seedDeals: Deal[] = [
  {
    id: "deal-sunrise",
    business: { legalName: "Sunrise Medical Supply LLC", dbaName: "Sunrise Medical", industry: "Medical supplies", state: "FL", startDate: "2017-03-12", requestedAmount: 250000, contact: { name: "Elena Ramirez", email: "elena@sunrisemedical.example", phone: "(305) 555-0184" }, notes: "Inventory expansion for regional hospital contracts." },
    documents: processedDocuments,
    status: "needs_review",
    entryMode: "manual",
    createdAt: "2025-06-14T14:10:00.000Z",
    updatedAt: "2025-06-14T16:24:00.000Z",
    analysis: mockAnalysis,
  },
  {
    id: "deal-atlas",
    business: { legalName: "Atlas Commercial Roofing Inc.", dbaName: "Atlas Roofing", industry: "Construction", state: "TX", startDate: "2013-08-21", requestedAmount: 175000, contact: { name: "Marcus Cole", email: "mcole@atlasroofing.example", phone: "(214) 555-0119" }, notes: "Working capital for two awarded projects." },
    documents: processedDocuments.slice(0, 5).map((document, index) => ({ ...document, id: `atlas-${index}` })),
    status: "completed",
    entryMode: "manual",
    createdAt: "2025-06-11T13:20:00.000Z",
    updatedAt: "2025-06-12T10:15:00.000Z",
    analysis: { ...mockAnalysis, estimatedMonthlyRevenue: 152300, riskFlags: mockAnalysis.riskFlags.slice(0, 1) },
  },
  {
    id: "deal-coastal",
    business: { legalName: "Coastal Table & Tap LLC", dbaName: "Coastal Table", industry: "Restaurant", state: "SC", startDate: "2021-05-04", requestedAmount: 90000, contact: { name: "Nina Patel", email: "nina@coastaltable.example", phone: "(843) 555-0128" }, notes: "Second location build-out." },
    documents: processedDocuments.slice(0, 4).map((document, index) => ({ ...document, id: `coastal-${index}`, processingStatus: "selected" })),
    status: "ready",
    entryMode: "automated",
    createdAt: "2025-06-09T17:45:00.000Z",
    updatedAt: "2025-06-09T17:45:00.000Z",
  },
  {
    id: "deal-northline",
    business: { legalName: "Northline Logistics Group LLC", dbaName: "Northline Logistics", industry: "Transportation", state: "IL", startDate: "2019-11-18", requestedAmount: 320000, contact: { name: "Darius King", email: "dking@northline.example", phone: "(312) 555-0165" }, notes: "Fleet maintenance and fuel reserve." },
    documents: processedDocuments.slice(0, 2).map((document, index) => ({ ...document, id: `northline-${index}` })),
    status: "draft",
    entryMode: "manual",
    createdAt: "2025-06-07T09:30:00.000Z",
    updatedAt: "2025-06-07T09:30:00.000Z",
  },
];
