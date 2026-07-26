import type { NdaParty } from "./schema";

export function formatDate(value: string): string {
  if (!value) return "";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatSignatoryNameAndTitle(party: NdaParty): string {
  if (party.signatoryName && party.signatoryTitle) {
    return `${party.signatoryName}, ${party.signatoryTitle}`;
  }
  return party.signatoryName || party.signatoryTitle;
}

export function formatNoticeAddress(party: NdaParty): string {
  return [party.noticeEmail, party.noticePostalAddress].filter(Boolean).join(" / ");
}
