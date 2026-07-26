import type { NdaFormValues, NdaParty } from "./schema";

const emptyParty: NdaParty = {
  companyName: "",
  signatoryName: "",
  signatoryTitle: "",
  noticeEmail: "",
  noticePostalAddress: "",
  signature: "",
  date: "",
};

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
