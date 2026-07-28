import type { FieldDescriptor } from "@/lib/templates/chat";
import { RIGHTS_IN_DELIVERABLES_OPTIONS } from "./schema";

export const PSA_TEMPLATE_NAME = "Bonterms Professional Services Agreement";

export const PSA_OPTIONAL_FIELD_PATH = "additionalTerms";

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

export const psaFieldDescriptors: FieldDescriptor[] = [
  { path: "effectiveDate", label: "Effective date" },
  {
    path: "rightsInDeliverables",
    label: "Rights in Deliverables (whether Deliverables are licensed to or assigned to Customer)",
    options: [...RIGHTS_IN_DELIVERABLES_OPTIONS],
  },
  { path: "governingLaw", label: "Governing law" },
  { path: "courts", label: "Courts" },
  ...partyDescriptors("customer", "Customer"),
  ...partyDescriptors("provider", "Provider"),
  { path: "additionalTerms", label: "Additional terms (optional)" },
];
