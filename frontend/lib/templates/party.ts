import { z } from "zod";

export const partySchema = z
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

export type Party = z.infer<typeof partySchema>;

export const emptyParty: Party = {
  companyName: "",
  signatoryName: "",
  signatoryTitle: "",
  noticeEmail: "",
  noticePostalAddress: "",
  signature: "",
  date: "",
};
