import type { FieldDescriptor } from "@/lib/templates/chat";

export const NDA_TEMPLATE_NAME = "Bonterms Mutual NDA";

// additionalTerms passes validation even when blank, so the chat asks about it once
// after everything else validates, then stops asking.
export const NDA_OPTIONAL_FIELD_PATH = "additionalTerms";

function partyDescriptors(prefix: string, title: string): FieldDescriptor[] {
  return [
    { path: `${prefix}.companyName`, label: `${title} company/party name` },
    { path: `${prefix}.signatoryName`, label: `${title} signatory name` },
    { path: `${prefix}.signatoryTitle`, label: `${title} signatory title` },
    { path: `${prefix}.noticeEmail`, label: `${title} notice email or postal address` },
    { path: `${prefix}.noticePostalAddress`, label: `${title} notice postal address` },
    { path: `${prefix}.signature`, label: `${title} signature (typed full name)` },
    { path: `${prefix}.date`, label: `${title} signature date` },
  ];
}

export const ndaFieldDescriptors: FieldDescriptor[] = [
  { path: "purpose", label: "Purpose (how Confidential Information may be used)" },
  { path: "effectiveDate", label: "Effective date" },
  { path: "termOfNda", label: "Term of the NDA" },
  { path: "confidentialityPeriod", label: "Confidentiality period" },
  { path: "governingLaw", label: "Governing law" },
  { path: "courts", label: "Courts" },
  ...partyDescriptors("partyA", "Party 1"),
  ...partyDescriptors("partyB", "Party 2"),
  { path: "additionalTerms", label: "Additional terms (optional)" },
];
