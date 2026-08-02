import { mockAnalysis } from "@/data/mockData";
import type { AnalysisResult, Deal } from "@/types/deal";

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

// Sample mode only. Replace this function with a call to a secure server-side endpoint
// or Supabase Edge Function. A Gemini API key must never be included in frontend code.
export const analyzeDeal = async (deal: Deal): Promise<AnalysisResult> => {
  await wait(2400);
  const sampleResult = JSON.parse(JSON.stringify(mockAnalysis)) as AnalysisResult;

  return {
    ...sampleResult,
    generatedAt: new Date().toISOString(),
    dataSource: "sample",
    model: "sample-ruleset",
    documentIds: deal.documents.map((document) => document.id),
    summary: `Sample Analysis: ${deal.business.legalName} is a ${deal.business.industry.toLowerCase()} business requesting ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(deal.business.requestedAmount)}. Synthetic adjusted-revenue, balance, financing, and risk results are shown only to demonstrate the review workflow.`,
    warnings: [
      "Sample Analysis only. Uploaded file contents were not reviewed.",
      ...sampleResult.warnings.filter((warning) => !warning.startsWith("Sample Analysis only")),
    ],
  };
};
