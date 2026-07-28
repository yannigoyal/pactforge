import { z } from "zod";
import { partySchema } from "@/lib/templates/party";

export const ndaFormSchema = z.object({
  purpose: z.string().trim().min(1, "Purpose is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  termOfNda: z.string().trim().min(1, "Term of NDA is required"),
  confidentialityPeriod: z.string().trim().min(1, "Confidentiality period is required"),
  governingLaw: z.string().trim().min(1, "Governing law is required"),
  courts: z.string().trim().min(1, "Courts is required"),
  additionalTerms: z.string().trim(),
  partyA: partySchema,
  partyB: partySchema,
});

export type NdaFormValues = z.infer<typeof ndaFormSchema>;
