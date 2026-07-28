import type { FieldDescriptor } from "@/lib/templates/chat";
import { partyFieldDescriptors } from "@/lib/templates/party";

export const NDA_TEMPLATE_NAME = "Bonterms Mutual NDA";

// additionalTerms passes validation even when blank, so the chat asks about it once
// after everything else validates, then stops asking.
export const NDA_OPTIONAL_FIELD_PATH = "additionalTerms";

export const ndaFieldDescriptors: FieldDescriptor[] = [
  { path: "purpose", label: "Purpose (how Confidential Information may be used)" },
  { path: "effectiveDate", label: "Effective date" },
  { path: "termOfNda", label: "Term of the NDA" },
  { path: "confidentialityPeriod", label: "Confidentiality period" },
  { path: "governingLaw", label: "Governing law" },
  { path: "courts", label: "Courts" },
  ...partyFieldDescriptors("partyA", "Party 1"),
  ...partyFieldDescriptors("partyB", "Party 2"),
  { path: "additionalTerms", label: "Additional terms (optional)" },
];
