import type { FieldDescriptor } from "@/lib/templates/chat";
import { partyFieldDescriptors } from "@/lib/templates/party";
import { RIGHTS_IN_DELIVERABLES_OPTIONS } from "./schema";

export const PSA_TEMPLATE_NAME = "Bonterms Professional Services Agreement";

export const PSA_OPTIONAL_FIELD_PATH = "additionalTerms";

export const psaFieldDescriptors: FieldDescriptor[] = [
  { path: "effectiveDate", label: "Effective date" },
  {
    path: "rightsInDeliverables",
    label: "Rights in Deliverables (whether Deliverables are licensed to or assigned to Customer)",
    options: [...RIGHTS_IN_DELIVERABLES_OPTIONS],
  },
  { path: "governingLaw", label: "Governing law" },
  { path: "courts", label: "Courts" },
  ...partyFieldDescriptors("customer", "Customer"),
  ...partyFieldDescriptors("provider", "Provider"),
  { path: "additionalTerms", label: "Additional terms (optional)" },
];
