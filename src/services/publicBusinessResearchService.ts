import type {
  Document,
  ExtractedField,
  PublicBusinessProfile,
  PublicResearchResult,
  PublicResearchSource,
  ProfileConflict,
} from "@/types/deal";

const wait = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

const found = (
  value: string,
  source: ExtractedField["source"],
  confidence: number,
  sourceName: string,
  sourceUrl: string,
): ExtractedField => ({
  value,
  source,
  confidence,
  reviewStatus:
    source === "public_record"
      ? "publicly_corroborated"
      : confidence >= 0.85
        ? "found"
        : "low_confidence",
  userEdited: false,
});

const notFound = (): ExtractedField => ({
  value: "",
  source: "public_record",
  confidence: 0,
  reviewStatus: "not_found",
  userEdited: false,
});

const sampleSources: PublicResearchSource[] = [
  {
    title: "Summit Building Supply LLC — Entity Details",
    publisher: "Texas Secretary of State",
    url: "https://direct.sos.state.tx.us/business-entity/summit-building-supply-llc",
    retrievedAt: new Date().toISOString(),
    supportingText:
      "Summit Building Supply LLC is registered as an active LLC in Texas. Formation date: March 22, 2016. Registered agent on file.",
    sourceCategory: "State business registry",
    matchConfidence: 0.95,
  },
  {
    title: "Summit Building Supply — Company Profile",
    publisher: "Official business website",
    url: "https://www.summitsupply.example/about",
    retrievedAt: new Date().toISOString(),
    supportingText:
      "Wholesale distributor of commercial building supplies serving the Dallas-Fort Worth metroplex since 2016. Products include fasteners, tools, safety equipment, and specialty hardware.",
    sourceCategory: "Official business website",
    matchConfidence: 0.91,
  },
  {
    title: "Summit Building Supply LLC — Business Listing",
    publisher: "Google Business Profile",
    url: "https://www.google.com/maps/place/Summit+Building+Supply",
    retrievedAt: new Date().toISOString(),
    supportingText:
      "Wholesale building supply company. Address: 2480 Industrial Blvd, Dallas, TX 75207. Phone: (214) 555-0193.",
    sourceCategory: "Verified business directory",
    matchConfidence: 0.88,
  },
];

const buildSampleProfile = (): PublicBusinessProfile => ({
  legalBusinessName: found(
    "Summit Building Supply LLC",
    "public_record",
    0.95,
    "Texas Secretary of State",
    sampleSources[0].url,
  ),
  dbaName: found(
    "Summit Supply",
    "business_website",
    0.82,
    "Official business website",
    sampleSources[1].url,
  ),
  businessAddress: found(
    "2480 Industrial Blvd, Dallas, TX 75207",
    "public_record",
    0.93,
    "Google Business Profile",
    sampleSources[2].url,
  ),
  website: found(
    "summitsupply.example",
    "business_website",
    0.90,
    "Official business website",
    sampleSources[1].url,
  ),
  phone: found(
    "(214) 555-0193",
    "public_record",
    0.86,
    "Google Business Profile",
    sampleSources[2].url,
  ),
  email: notFound(),
  industry: found(
    "Wholesale / distribution",
    "ai_inference",
    0.79,
    "AI-inferred industry from public sources",
    sampleSources[1].url,
  ),
  formationDate: found(
    "2016-03-22",
    "public_record",
    0.95,
    "Texas Secretary of State",
    sampleSources[0].url,
  ),
  entityType: found(
    "Limited Liability Company (LLC)",
    "public_record",
    0.95,
    "Texas Secretary of State",
    sampleSources[0].url,
  ),
  registrationStatus: found(
    "Active",
    "public_record",
    0.96,
    "Texas Secretary of State",
    sampleSources[0].url,
  ),
  description: found(
    "Wholesale distributor of commercial building supplies serving the Dallas-Fort Worth metroplex.",
    "business_website",
    0.88,
    "Official business website",
    sampleSources[1].url,
  ),
  locations: found(
    "1 location — Dallas, TX",
    "public_record",
    0.90,
    "Google Business Profile",
    sampleSources[2].url,
  ),
  sources: sampleSources,
});

const buildSampleConflicts = (): ProfileConflict[] => [
  {
    fieldKey: "businessStartDate",
    fieldLabel: "Business Start Date",
    applicationValue: "April 15, 2016 (from loan application)",
    publicValue: "March 22, 2016 (Texas Secretary of State formation date)",
    applicationSource: "Loan application (page 2)",
    publicSource: "Texas Secretary of State filing",
    resolution: null,
  },
  {
    fieldKey: "industry",
    fieldLabel: "Industry",
    applicationValue: "Wholesale / distribution (stated on application)",
    publicValue: "Wholesale / distribution (AI-inferred from public sources)",
    applicationSource: "Loan application (page 1)",
    publicSource: "Official business website + Google Business Profile",
    resolution: null,
  },
];

/**
 * Simulated public business research service.
 *
 * This will later call a secure server-side AI search endpoint.
 * Do NOT implement public web searches directly from the browser frontend.
 */
export const publicBusinessResearchService = {
  async search(_documents: Document[]): Promise<PublicResearchResult> {
    await wait(2000);

    return {
      profile: buildSampleProfile(),
      conflicts: buildSampleConflicts(),
      generatedAt: new Date().toISOString(),
      dataSource: "sample",
      warnings: [
        "Sample public research only. No live public databases were searched.",
        "A public record formation date is not necessarily the date the business began operating.",
        "The industry label shown from public sources is AI-inferred and requires analyst verification.",
      ],
    };
  },
};
