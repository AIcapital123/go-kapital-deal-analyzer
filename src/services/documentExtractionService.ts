import type {
  Document,
  ExtractedField,
  ExtractedFieldAlternative,
  ExtractedBusinessProfile,
  ProfileExtractionResult,
  ProfileConflict,
  MissingProfileField,
} from "@/types/deal";

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

/** Create an ExtractedField that was found with the given confidence. */
const found = <T extends string | number>(
  value: T,
  source: ExtractedField["source"],
  sourceDocumentId: string,
  sourceDocumentName: string,
  pageNumber: number,
  confidence: number,
  alternatives?: ExtractedFieldAlternative<T>[],
): ExtractedField<T> => ({
  value,
  source,
  sourceDocumentId,
  sourceDocumentName,
  pageNumber,
  confidence,
  reviewStatus: confidence >= 0.85 ? "found" : "low_confidence",
  userEdited: false,
  alternatives,
});

/** Create an ExtractedField that was not found in the documents. */
const notFound = (source: ExtractedField["source"] = "loan_application"): ExtractedField => ({
  value: "",
  source,
  confidence: 0,
  reviewStatus: "not_found",
  userEdited: false,
});

/**
 * Sample / simulated document extraction.
 *
 * Replace this with a call to a secure server-side endpoint (Supabase Edge
 * Function or similar) that uses an AI vision model to extract structured data
 * from uploaded documents. Never call AI document APIs directly from the browser.
 */
const buildSampleProfile = (
  documents: Document[],
): ExtractedBusinessProfile => {
  const application = documents.find(
    (d) => d.category === "Business loan application",
  );
  const bankStatement = documents.find((d) => d.category === "Bank statement");
  const taxReturn = documents.find((d) => d.category === "Tax return");
  const financial = documents.find(
    (d) =>
      d.category === "Profit and loss statement" ||
      d.category === "Balance sheet",
  );

  const appRef = application
    ? { id: application.id, name: application.name }
    : { id: "sample-app", name: "Sample loan application" };
  const bankRef = bankStatement
    ? { id: bankStatement.id, name: bankStatement.name }
    : { id: "sample-bank", name: "Sample bank statement" };

  return {
    legalBusinessName: found(
      "Summit Building Supply LLC",
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.95,
      bankStatement
        ? [
            {
              value: "Summit Building Supply LLC",
              source: "bank_statement",
              sourceDocumentId: bankRef.id,
              sourceDocumentName: bankRef.name,
              confidence: 0.92,
            },
          ]
        : undefined,
    ),
    dbaName: found(
      "Summit Supply",
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.88,
    ),
    ownerName: found(
      "Robert Chen",
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.94,
    ),
    businessAddress: found(
      "2480 Industrial Blvd, Dallas, TX 75207",
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.91,
      bankStatement
        ? [
            {
              value: "2480 Industrial Blvd, Dallas, TX 75207",
              source: "bank_statement",
              sourceDocumentId: bankRef.id,
              sourceDocumentName: bankRef.name,
              confidence: 0.89,
            },
          ]
        : undefined,
    ),
    email: found(
      "rchen@summitsupply.example",
      "loan_application",
      appRef.id,
      appRef.name,
      2,
      0.93,
    ),
    phone: found(
      "(214) 555-0193",
      "loan_application",
      appRef.id,
      appRef.name,
      2,
      0.92,
    ),
    industry: found(
      "Wholesale / distribution",
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.87,
    ),
    businessStartDate: found(
      "2016-04-15",
      "loan_application",
      appRef.id,
      appRef.name,
      2,
      0.90,
    ),
    timeInBusiness: found(
      "9 yrs 2 mo",
      "loan_application",
      appRef.id,
      appRef.name,
      2,
      0.90,
    ),
    requestedLoanAmount: found(
      185000,
      "loan_application",
      appRef.id,
      appRef.name,
      1,
      0.96,
    ),
    useOfFunds: found(
      "Inventory expansion and warehouse equipment",
      "loan_application",
      appRef.id,
      appRef.name,
      3,
      0.89,
    ),
    ownershipInfo: found(
      "Robert Chen — 100% owner",
      "loan_application",
      appRef.id,
      appRef.name,
      2,
      0.88,
    ),
    einLastFour: application
      ? found("7842", "loan_application", appRef.id, appRef.name, 2, 0.82)
      : notFound("loan_application"),
  };
};

const buildSampleConflicts = (
  profile: ExtractedBusinessProfile,
): ProfileConflict[] => {
  const conflicts: ProfileConflict[] = [];

  if (
    profile.businessStartDate.reviewStatus !== "not_found" &&
    profile.businessStartDate.value
  ) {
    conflicts.push({
      fieldKey: "businessStartDate",
      fieldLabel: "Business Start Date",
      applicationValue: profile.businessStartDate.value,
      publicValue: "2016-03-22",
      applicationSource: "Loan application (page 2)",
      publicSource: "Texas Secretary of State filing",
      resolution: null,
    });
  }

  return conflicts;
};

const buildSampleMissing = (
  profile: ExtractedBusinessProfile,
  documents: Document[],
): MissingProfileField[] => {
  const missing: MissingProfileField[] = [];

  Object.entries(profile).forEach(([key, field]) => {
    if (field.reviewStatus === "not_found") {
      missing.push({
        fieldKey: key,
        fieldLabel: keyToLabel(key),
        required: false,
      });
    }
  });

  if (!documents.some((d) => d.category === "Tax return")) {
    missing.push({
      fieldKey: "taxReturn",
      fieldLabel: "Tax return data",
      required: false,
    });
  }

  return missing;
};

const keyToLabel = (key: string): string => {
  const labels: Record<string, string> = {
    legalBusinessName: "Legal Business Name",
    dbaName: "DBA Name",
    ownerName: "Primary Contact / Owner",
    businessAddress: "Business Address",
    email: "Email",
    phone: "Phone Number",
    industry: "Industry",
    businessStartDate: "Business Start Date",
    timeInBusiness: "Time in Business",
    requestedLoanAmount: "Requested Loan Amount",
    useOfFunds: "Use of Funds",
    ownershipInfo: "Ownership Information",
    einLastFour: "EIN (last four)",
  };
  return labels[key] ?? key;
};

export { keyToLabel };

/**
 * Simulated document extraction service.
 *
 * In production this will call a secure server-side AI endpoint to extract
 * structured data from uploaded loan applications, bank statements, and
 * supporting documents. Never call document AI from the browser.
 */
export const documentExtractionService = {
  async extract(documents: Document[]): Promise<ProfileExtractionResult> {
    await wait(2000);

    const profile = buildSampleProfile(documents);
    const conflicts = buildSampleConflicts(profile);
    const missingFields = buildSampleMissing(profile, documents);

    const hasApplication = documents.some(
      (d) => d.category === "Business loan application",
    );

    return {
      businessProfile: profile,
      conflicts,
      missingFields,
      generatedAt: new Date().toISOString(),
      dataSource: "sample",
      warnings: [
        "Sample extraction only. Uploaded document contents were not read.",
        ...(hasApplication
          ? []
          : [
              "No loan application was uploaded — contact and requested-amount fields were not extracted.",
            ]),
      ],
    };
  },
};
