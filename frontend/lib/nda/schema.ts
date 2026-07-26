import { z } from "zod";

const partySchema = z
  .object({
    companyName: z.string().trim().min(1, "Company / party name is required"),
    signatoryName: z.string().trim().min(1, "Signatory name is required"),
    signatoryTitle: z.string().trim().min(1, "Signatory title is required"),
    noticeEmail: z.union([z.literal(""), z.string().trim().email("Invalid email")]),
    noticePostalAddress: z.string().trim(),
    signature: z.string().trim().min(1, "Signature is required"),
    date: z.string().min(1, "Date is required"),
  })
  .refine(
    (party) => party.noticeEmail !== "" || party.noticePostalAddress.trim() !== "",
    {
      message: "Provide an email or postal address for notices",
      path: ["noticeEmail"],
    },
  );

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
export type NdaParty = z.infer<typeof partySchema>;
