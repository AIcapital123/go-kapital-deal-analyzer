import { mockAnalysis } from "@/data/mockData";
import type {
  Document,
  ExtractedBusinessProfile,
  MissingProfileField,
  PublicResearchResult,
  UnderwritingSummary,
  BankStatementMonth,
  ExistingLoan,
  RecentFundingActivity,
  TaxReturnSummary,
  RiskFlag,
} from "@/types/deal";

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/**
 * Simulated underwriting analysis service.
 *
 * Combines the extracted business profile, public research, and bank-statement
 * data into a structured revenue and underwriting summary. In production this
 * will call a secure server-side AI endpoint. Never analyze documents from
 * the browser.
 */
export const underwritingAnalysisService = {
  async generate(
    profile: ExtractedBusinessProfile,
    publicResearch: PublicResearchResult | null,
    documents: Document[],
  ): Promise<UnderwritingSummary> {
    await wait(2200);

    const bankStatements: BankStatementMonth[] = clone(mockAnalysis.bankStatements);
    const existingLoans: ExistingLoan[] = clone(mockAnalysis.existingLoans);
    const recentFunding: RecentFundingActivity[] = clone(mockAnalysis.recentFunding);

    const hasTaxReturn = documents.some((d) => d.category === "Tax return");
    const taxReturns: TaxReturnSummary[] = hasTaxReturn
      ? clone(mockAnalysis.taxReturns)
      : [];

    const riskFlags: RiskFlag[] = clone(mockAnalysis.riskFlags);

    const missingInfo: MissingProfileField[] = [];
    Object.entries(profile).forEach(([key, field]) => {
      if (field.reviewStatus === "not_found") {
        missingInfo.push({
          fieldKey: key,
          fieldLabel: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()),
          required: false,
        });
      }
    });

    const count = Math.max(1, bankStatements.length);
    const avgGross = bankStatements.reduce((s, m) => s + m.grossDeposits, 0) / count;
    const avgAdjusted = bankStatements.reduce((s, m) => s + m.adjustedBusinessRevenue, 0) / count;
    const avgBalance = bankStatements.reduce((s, m) => s + m.averageDailyBalance, 0) / count;
    const totalNeg = bankStatements.reduce((s, m) => s + m.negativeBalanceDays, 0);
    const totalNsf = bankStatements.reduce((s, m) => s + m.nsfCount, 0);
    const estPayments = existingLoans.reduce((s, l) => s + l.estimatedMonthlyPayment, 0);

    const warnings = [
      "Sample underwriting summary only. Uploaded documents were not analyzed.",
      "This summary assists document review and does not constitute an approval, decline, or final underwriting decision. All results require human verification.",
    ];

    if (!documents.some((d) => d.category === "Business loan application")) {
      warnings.push(
        "No loan application was uploaded. Contact and requested-amount fields may be incomplete.",
      );
    }
    if (!hasTaxReturn) {
      warnings.push("No tax return was uploaded. Tax summary section is omitted.");
    }

    return {
      businessProfile: profile,
      publicResearch,
      bankStatements,
      existingLoans,
      recentFunding,
      taxReturns,
      riskFlags,
      missingInfo,
      analystNotes: "",
      generatedAt: new Date().toISOString(),
      dataSource: "sample",
      warnings,
      averageMonthlyGrossDeposits: Math.round(avgGross),
      averageMonthlyAdjustedRevenue: Math.round(avgAdjusted),
      averageDailyBalance: Math.round(avgBalance),
      revenueTrend: "Declining 11.9% (Feb to May)",
      totalNegativeDays: totalNeg,
      totalNsfEvents: totalNsf,
      estimatedMonthlyFinancingPayments: estPayments,
    };
  },
};
