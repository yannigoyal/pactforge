import { Link, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Party } from "@/lib/templates/party";
import type { DocBlock, InlineSegment } from "@/lib/templates/markdown";
import { formatDate, formatNoticeAddress, formatSignatoryNameAndTitle } from "@/lib/templates/format";

export const pdfStyles = StyleSheet.create({
  page: { padding: 48, fontSize: 10, fontFamily: "Helvetica", color: "#1e293b" },
  title: { fontSize: 14, fontWeight: 700, marginBottom: 8 },
  intro: { fontSize: 9, color: "#475569", marginBottom: 16, lineHeight: 1.4 },
  sectionLabel: { fontSize: 10, fontWeight: 700, marginTop: 12, marginBottom: 4 },
  termRow: { flexDirection: "row", marginBottom: 3 },
  termLabel: { width: 140, color: "#475569" },
  termValue: { flex: 1 },
  placeholder: { color: "#94a3b8", fontStyle: "italic" },
  partiesRow: { flexDirection: "row", gap: 24, marginTop: 8 },
  partyBlock: { flex: 1 },
  partyLine: { marginBottom: 2 },
  bodyHeading: { fontSize: 12, fontWeight: 700, textAlign: "center", marginBottom: 12 },
  bodyItem: { marginBottom: 6, lineHeight: 1.4 },
  bodySubsection: { marginBottom: 6, marginLeft: 12, lineHeight: 1.4 },
  bodySubitem: { marginBottom: 6, marginLeft: 18, lineHeight: 1.4 },
  bodyFooter: { marginTop: 8, paddingTop: 8, borderTop: "1pt solid #e2e8f0", fontSize: 8, color: "#64748b" },
});

function displayValue(value: string) {
  return value || "Not provided";
}

export function TermRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <View style={pdfStyles.termRow}>
      <Text style={pdfStyles.termLabel}>{label}</Text>
      <Text style={empty ? [pdfStyles.termValue, pdfStyles.placeholder] : pdfStyles.termValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

export function PdfPartyBlock({ title, party }: { title: string; party: Party }) {
  const notice = formatNoticeAddress(party);
  const nameAndTitle = formatSignatoryNameAndTitle(party);

  return (
    <View style={pdfStyles.partyBlock}>
      <Text style={[pdfStyles.partyLine, { fontWeight: 700 }]}>{title}</Text>
      <Text style={pdfStyles.partyLine}>Party Name: {displayValue(party.companyName)}</Text>
      <Text style={pdfStyles.partyLine}>Signature: {displayValue(party.signature)}</Text>
      <Text style={pdfStyles.partyLine}>Name and Title: {displayValue(nameAndTitle)}</Text>
      <Text style={pdfStyles.partyLine}>Notice Address: {displayValue(notice)}</Text>
      <Text style={pdfStyles.partyLine}>Date: {displayValue(formatDate(party.date))}</Text>
    </View>
  );
}

export function InlineSpans({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        const fontFamily = segment.bold
          ? "Helvetica-Bold"
          : segment.italic
            ? "Helvetica-Oblique"
            : "Helvetica";
        if (segment.href) {
          return (
            <Link key={index} src={segment.href} style={{ fontFamily, color: "#334155" }}>
              {segment.text}
            </Link>
          );
        }
        return (
          <Text key={index} style={{ fontFamily }}>
            {segment.text}
          </Text>
        );
      })}
    </>
  );
}

export function PdfDocBody({ blocks }: { blocks: DocBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return (
              <Text key={index} style={pdfStyles.bodyHeading}>
                <InlineSpans segments={block.inline} />
              </Text>
            );
          case "item":
            return (
              <Text key={index} style={pdfStyles.bodyItem}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{block.number}. </Text>
                <InlineSpans segments={block.inline} />
              </Text>
            );
          case "subsection":
            return (
              <Text key={index} style={pdfStyles.bodySubsection}>
                <Text>{block.number}. </Text>
                <InlineSpans segments={block.inline} />
              </Text>
            );
          case "subitem":
            return (
              <Text key={index} style={pdfStyles.bodySubitem}>
                <Text>{block.marker} </Text>
                <InlineSpans segments={block.inline} />
              </Text>
            );
          case "footer":
            return (
              <View key={index} style={pdfStyles.bodyFooter}>
                {block.lines.map((line, lineIndex) => (
                  <Text key={lineIndex}>
                    <InlineSpans segments={line} />
                  </Text>
                ))}
              </View>
            );
          case "paragraph":
            return (
              <Text key={index} style={pdfStyles.bodyItem}>
                <InlineSpans segments={block.inline} />
              </Text>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
