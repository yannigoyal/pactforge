import type { Party } from "./party";

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

export function formatSignatoryNameAndTitle(party: Party): string {
  if (party.signatoryName && party.signatoryTitle) {
    return `${party.signatoryName}, ${party.signatoryTitle}`;
  }
  return party.signatoryName || party.signatoryTitle;
}

export function formatNoticeAddress(party: Party): string {
  return [party.noticeEmail, party.noticePostalAddress].filter(Boolean).join(" / ");
}
