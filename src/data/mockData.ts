import type { AnalysisResult, Deal, Document } from "@/types/deal";

const processedDocuments: Document[] = [
  { id: "doc-1", name: "GoKapital_Application.pdf", type: "PDF", category: "Business loan application", size: 842000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
  { id: "doc-2", name: "May_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "May 2025", size: 1240000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
  { id: "doc-3", name: "April_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "Apr 2025", size: 1180000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
  { id: "doc-4", name: "March_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "Mar 2025", size: 1090000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
  { id: "doc-5", name: "February_2025_Bank_Statement.pdf", type: "PDF", category: "Bank statement", period: "Feb 2025", size: 1310000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
  { id: "doc-6", name: "2024_Business_Tax_Return.pdf", type: "PDF", category: "Tax return", period: "2024", size: 2480000, uploadDate: "2025-06-14", uploadStatus: "ready", processingStatus: "processed" },
];

export const mockAnalysis: AnalysisResult = {
  generatedAt: "2025-06-14T16:24:00.000Z",
  prototype: true,
  estimatedMonthlyRevenue: 184750,
  existingFinancingPositions: 2,
  cashFlowObservation: "Cash flow is generally positive, but balances tightened in the two most recent months while daily debt service remained elevated.",
  summary: "Sunrise Medical Supply LLC is an established healthcare distributor requesting working capital to expand inventory. Deposit volume supports the request, subject to verification of existing daily obligations and recent balance compression.",
  bankStatements: [
    { month: "May 2025", totalDeposits: 172400, averageDailyBalance: 12840, numberOfDeposits: 38, negativeBalanceDays: 3, endingBalance: 8240, nsfCount: 2 },
    { month: "Apr 2025", totalDeposits: 179800, averageDailyBalance: 14620, numberOfDeposits: 41, negativeBalanceDays: 1, endingBalance: 12110, nsfCount: 1 },
    { month: "Mar 2025", totalDeposits: 191300, averageDailyBalance: 18320, numberOfDeposits: 43, negativeBalanceDays: 0, endingBalance: 19480, nsfCount: 0 },
    { month: "Feb 2025", totalDeposits: 195500, averageDailyBalance: 20140, numberOfDeposits: 46, negativeBalanceDays: 0, endingBalance: 22160, nsfCount: 0 },
  ],
  existingLoans: [
    { lender: "Forward Capital", accountName: "FWD CAP ACH", fundingDate: "2025-01-17", originalAmount: 85000, observedDebit: 585, frequency: "Daily", estimatedMonthlyPayment: 12870, status: "Active" },
    { lender: "Metro Equipment Finance", accountName: "METRO EQUIP", fundingDate: "2024-08-09", originalAmount: 48000, observedDebit: 2140, frequency: "Monthly", estimatedMonthlyPayment: 2140, status: "Likely active" },
  ],
  recentFunding: [
    { funder: "Forward Capital", depositDate: "Jan 17, 2025", depositAmount: 82025, observedDebit: 585, frequency: "Weekdays", sourceDocument: "January 2025 statement" },
    { funder: "Metro Equipment Finance", depositDate: "Aug 9, 2024", depositAmount: 48000, observedDebit: 2140, frequency: "Monthly", sourceDocument: "Application / April statement" },
  ],
  taxReturns: [
    { taxYear: 2024, grossRevenue: 2184000, costOfGoodsSold: 1420000, grossProfit: 764000, netIncome: 186000, totalAssets: 648000, totalLiabilities: 391000 },
    { taxYear: 2023, grossRevenue: 1965000, costOfGoodsSold: 1284000, grossProfit: 681000, netIncome: 159000, totalAssets: 582000, totalLiabilities: 356000 },
  ],
  revenueChange: 11.1,
  taxBankInconsistency: "Annualized recent bank deposits are approximately 1.5% above reported 2024 gross revenue, within a reasonable review tolerance.",
  riskFlags: [
    { id: "risk-1", title: "Declining deposit trend", severity: "Medium", explanation: "Deposits declined 11.8% from February through May.", sourceDocument: "February–May 2025 bank statements", recommendation: "Confirm whether the decline is seasonal and request June month-to-date activity." },
    { id: "risk-2", title: "Existing daily MCA payments", severity: "High", explanation: "Weekday debits of approximately $585 indicate an active merchant cash advance.", sourceDocument: "April and May 2025 bank statements", recommendation: "Obtain a current payoff letter and include the obligation in global cash-flow analysis." },
    { id: "risk-3", title: "Recent NSF activity", severity: "Medium", explanation: "Three NSF or overdraft events were observed in the last two months.", sourceDocument: "April and May 2025 bank statements", recommendation: "Review transaction detail and confirm all items were cured." },
  ],
};

export const seedDeals: Deal[] = [
  {
    id: "deal-sunrise",
    business: { legalName: "Sunrise Medical Supply LLC", dbaName: "Sunrise Medical", industry: "Medical supplies", state: "FL", startDate: "2017-03-12", requestedAmount: 250000, contact: { name: "Elena Ramirez", email: "elena@sunrisemedical.example", phone: "(305) 555-0184" }, notes: "Inventory expansion for regional hospital contracts." },
    documents: processedDocuments,
    status: "needs_review",
    createdAt: "2025-06-14T14:10:00.000Z",
    updatedAt: "2025-06-14T16:24:00.000Z",
    analysis: mockAnalysis,
  },
  {
    id: "deal-atlas",
    business: { legalName: "Atlas Commercial Roofing Inc.", dbaName: "Atlas Roofing", industry: "Construction", state: "TX", startDate: "2013-08-21", requestedAmount: 175000, contact: { name: "Marcus Cole", email: "mcole@atlasroofing.example", phone: "(214) 555-0119" }, notes: "Working capital for two awarded projects." },
    documents: processedDocuments.slice(0, 5).map((document, index) => ({ ...document, id: `atlas-${index}` })),
    status: "completed",
    createdAt: "2025-06-11T13:20:00.000Z",
    updatedAt: "2025-06-12T10:15:00.000Z",
    analysis: { ...mockAnalysis, estimatedMonthlyRevenue: 152300, riskFlags: mockAnalysis.riskFlags.slice(0, 1) },
  },
  {
    id: "deal-coastal",
    business: { legalName: "Coastal Table & Tap LLC", dbaName: "Coastal Table", industry: "Restaurant", state: "SC", startDate: "2021-05-04", requestedAmount: 90000, contact: { name: "Nina Patel", email: "nina@coastaltable.example", phone: "(843) 555-0128" }, notes: "Second location build-out." },
    documents: processedDocuments.slice(0, 4).map((document, index) => ({ ...document, id: `coastal-${index}`, processingStatus: "pending" })),
    status: "ready",
    createdAt: "2025-06-09T17:45:00.000Z",
    updatedAt: "2025-06-09T17:45:00.000Z",
  },
  {
    id: "deal-northline",
    business: { legalName: "Northline Logistics Group LLC", dbaName: "Northline Logistics", industry: "Transportation", state: "IL", startDate: "2019-11-18", requestedAmount: 320000, contact: { name: "Darius King", email: "dking@northline.example", phone: "(312) 555-0165" }, notes: "Fleet maintenance and fuel reserve." },
    documents: processedDocuments.slice(0, 2).map((document, index) => ({ ...document, id: `northline-${index}` })),
    status: "draft",
    createdAt: "2025-06-07T09:30:00.000Z",
    updatedAt: "2025-06-07T09:30:00.000Z",
  },
];
