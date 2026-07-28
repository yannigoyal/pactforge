import { emptyParty } from "@/lib/templates/party";
import type { NdaFormValues } from "./schema";

export const defaultNdaFormValues: NdaFormValues = {
  purpose: "",
  effectiveDate: "",
  termOfNda: "",
  confidentialityPeriod: "",
  governingLaw: "",
  courts: "",
  additionalTerms: "",
  partyA: { ...emptyParty },
  partyB: { ...emptyParty },
};
