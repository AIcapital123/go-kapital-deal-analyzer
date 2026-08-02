import { mockAnalysis } from "@/data/mockData";
import type { AnalysisResult, Deal } from "@/types/deal";

const wait = (milliseconds: number) =>
  new Promise((resolve) => window.setTimeout(resolve, milliseconds));

// Prototype only. Replace this function with a call to a secure server-side endpoint
// or Supabase Edge Function. A Gemini API key must never be included in frontend code.
export const analyzeDeal = async (_deal: Deal): Promise<AnalysisResult> => {
  await wait(2400);
  return {
    ...mockAnalysis,
    generatedAt: new Date().toISOString(),
    bankStatements: mockAnalysis.bankStatements.map((month) => ({ ...month })),
    riskFlags: mockAnalysis.riskFlags.map((flag) => ({ ...flag })),
  };
};
