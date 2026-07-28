import { emptyParty } from "@/lib/templates/party";
import type { PsaFormValues } from "./schema";

export const defaultPsaFormValues: PsaFormValues = {
  effectiveDate: "",
  // Starts blank so the select shows its placeholder; the schema rejects it until chosen.
  rightsInDeliverables: "" as PsaFormValues["rightsInDeliverables"],
  governingLaw: "",
  courts: "",
  additionalTerms: "",
  customer: { ...emptyParty },
  provider: { ...emptyParty },
};
