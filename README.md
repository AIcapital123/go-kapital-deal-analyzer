# GoKapital Deal Analyzer

GoKapital Deal Analyzer is a responsive frontend prototype for commercial-finance brokers. It demonstrates how a broker can create a business-loan deal, organize supporting document metadata, review a structured underwriting summary, and return to saved work without a connected backend.

## Current prototype features

- GoKapital dashboard with pipeline summary cards and recent deals
- Searchable and filterable all-deals view
- Three-step New Deal workflow for business information, document selection, and review
- Local file metadata selection for PDF, JPG, JPEG, and PNG files
- File validation for duplicate names, 25 MB file size limits, and a maximum of 20 documents per deal
- Manual bank-statement month and year fields with duplicate and missing-month warnings
- Deal Details views for overview, documents, Sample Analysis, and broker notes
- Sample bank, financing, tax-return, risk, and source-evidence results
- Browser local-storage persistence and a safe reset option
- Responsive desktop sidebar and mobile navigation drawer

## Run the application

Requirements: a current Node.js LTS release and npm.

```bash
npm install
npm run dev
```

The production TypeScript build can be checked with:

```bash
npm run build
```

## Simulated functionality

This version does **not** upload, read, extract, or analyze file contents. Only temporary file metadata is retained in browser local storage.

“Run Sample Analysis” loads deterministic synthetic underwriting results so navigation, review, evidence, risk, and note-taking workflows can be tested. No Gemini model or other external AI service is called, and the displayed confidence values and source evidence are sample data.

## Planned secure architecture

A production implementation is expected to use:

1. **Supabase Authentication** to identify brokers and scope every deal to an authorized user or organization.
2. **Supabase Database** for deal, business, document, analysis, evidence, risk, and note records protected by Row Level Security.
3. **Private Supabase Storage** buckets for encrypted customer documents with short-lived signed access.
4. **A secure server-side function or Supabase Edge Function** to validate authorization, retrieve permitted documents, invoke Gemini, validate structured output, and store analysis provenance.
5. **Versioned prompts and analysis schemas** so results can be audited and safely reprocessed.

Gemini requests must be performed only by trusted server-side code. The frontend should call the secure function and receive authorized results; it should never communicate with Gemini using a secret key directly.

## Security warnings

> **Do not upload real customer documents to this prototype.** Secure private storage, authentication, authorization, retention controls, and production data handling are not implemented.

> **Never place a Gemini API key or Supabase service-role key in frontend code, browser storage, committed source files, or client-visible environment variables.** Service-role and AI provider secrets belong only in secured server-side secret storage.

This repository currently contains no Supabase connection, authentication, Gemini integration, billing, subscriptions, or user administration.
