import { z } from "zod";
import { partySchema } from "@/lib/templates/party";

export const RIGHTS_IN_DELIVERABLES_OPTIONS = [
  "Licensed Deliverables",
  "Assigned Deliverables",
] as const;

export const psaFormSchema = z.object({
  effectiveDate: z.string().min(1, "Effective date is required"),
  rightsInDeliverables: z.enum(RIGHTS_IN_DELIVERABLES_OPTIONS, {
    message: "Rights in Deliverables is required",
  }),
  governingLaw: z.string().trim().min(1, "Governing law is required"),
  courts: z.string().trim().min(1, "Courts is required"),
  additionalTerms: z.string().trim(),
  customer: partySchema,
  provider: partySchema,
});

export type PsaFormValues = z.infer<typeof psaFormSchema>;
