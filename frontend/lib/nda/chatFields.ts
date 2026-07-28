import { ndaFormSchema, type NdaFormValues } from "./schema";

export const FIELD_LABELS: Record<string, string> = {
  purpose: "Purpose (how Confidential Information may be used)",
  effectiveDate: "Effective date",
  termOfNda: "Term of the NDA",
  confidentialityPeriod: "Confidentiality period",
  governingLaw: "Governing law",
  courts: "Courts",
  "partyA.companyName": "Party 1 company/party name",
  "partyA.signatoryName": "Party 1 signatory name",
  "partyA.signatoryTitle": "Party 1 signatory title",
  "partyA.noticeEmail": "Party 1 notice email or postal address",
  "partyA.signature": "Party 1 signature (typed full name)",
  "partyA.date": "Party 1 signature date",
  "partyB.companyName": "Party 2 company/party name",
  "partyB.signatoryName": "Party 2 signatory name",
  "partyB.signatoryTitle": "Party 2 signatory title",
  "partyB.noticeEmail": "Party 2 notice email or postal address",
  "partyB.signature": "Party 2 signature (typed full name)",
  "partyB.date": "Party 2 signature date",
  additionalTerms: "Additional terms (optional)",
};

// additionalTerms passes validation even when blank, so it never shows up as a schema
// error. Ask about it once, after everything else validates, then stop asking.
const OPTIONAL_FIELD_PATH = "additionalTerms";

export interface NextField {
  path: string;
  label: string;
}

export function getNextField(
  values: NdaFormValues,
  hasAskedOptional: boolean,
): NextField | null {
  const result = ndaFormSchema.safeParse(values);
  if (!result.success) {
    const path = result.error.issues[0].path.join(".");
    return { path, label: FIELD_LABELS[path] ?? path };
  }
  if (!hasAskedOptional) {
    return { path: OPTIONAL_FIELD_PATH, label: FIELD_LABELS[OPTIONAL_FIELD_PATH] };
  }
  return null;
}

export { OPTIONAL_FIELD_PATH };
