import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { NdaFormValues, NdaParty } from "@/lib/nda/schema";
import type { InlineSegment, NdaBlock } from "@/lib/nda/markdown";
import { formatDate, formatNoticeAddress, formatSignatoryNameAndTitle } from "@/lib/nda/format";

interface NdaPdfDocumentProps {
  values: NdaFormValues;
  bodyBlocks: NdaBlock[];
}

const styles = StyleSheet.create({
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
  bodySubitem: { marginBottom: 6, marginLeft: 18, lineHeight: 1.4 },
  bodyFooter: { marginTop: 8, paddingTop: 8, borderTop: "1pt solid #e2e8f0", fontSize: 8, color: "#64748b" },
});

function displayValue(value: string) {
  return value || "Not provided";
}

function TermRow({ label, value }: { label: string; value: string }) {
  const empty = !value;
  return (
    <View style={styles.termRow}>
      <Text style={styles.termLabel}>{label}</Text>
      <Text style={empty ? [styles.termValue, styles.placeholder] : styles.termValue}>
        {displayValue(value)}
      </Text>
    </View>
  );
}

function PartyBlock({ title, party }: { title: string; party: NdaParty }) {
  const notice = formatNoticeAddress(party);
  const nameAndTitle = formatSignatoryNameAndTitle(party);

  return (
    <View style={styles.partyBlock}>
      <Text style={[styles.partyLine, { fontWeight: 700 }]}>{title}</Text>
      <Text style={styles.partyLine}>Party Name: {displayValue(party.companyName)}</Text>
      <Text style={styles.partyLine}>Signature: {displayValue(party.signature)}</Text>
      <Text style={styles.partyLine}>Name and Title: {displayValue(nameAndTitle)}</Text>
      <Text style={styles.partyLine}>Notice Address: {displayValue(notice)}</Text>
      <Text style={styles.partyLine}>Date: {displayValue(formatDate(party.date))}</Text>
    </View>
  );
}

function InlineSpans({ segments }: { segments: InlineSegment[] }) {
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

export function NdaPdfDocument({ values, bodyBlocks }: NdaPdfDocumentProps) {
  return (
    <Document title="Bonterms Mutual NDA">
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Cover Page for Bonterms Mutual NDA</Text>
        <Text style={styles.intro}>
          By executing this Cover Page, the parties enter into the Bonterms Mutual NDA (Version 1.0). This
          Cover Page controls over directly conflicting provisions of the Bonterms Mutual NDA.
        </Text>

        <Text style={styles.sectionLabel}>Key Terms</Text>
        <TermRow label="Purpose" value={values.purpose} />
        <TermRow label="Effective Date" value={formatDate(values.effectiveDate)} />
        <TermRow label="Term of NDA" value={values.termOfNda} />
        <TermRow label="Confidentiality Period" value={values.confidentialityPeriod} />
        <TermRow label="Governing Law" value={values.governingLaw} />
        <TermRow label="Courts" value={values.courts} />

        {values.additionalTerms ? (
          <>
            <Text style={styles.sectionLabel}>Additional Terms</Text>
            <Text>{values.additionalTerms}</Text>
          </>
        ) : null}

        <Text style={styles.sectionLabel}>Signatures</Text>
        <View style={styles.partiesRow}>
          <PartyBlock title="Party 1" party={values.partyA} />
          <PartyBlock title="Party 2" party={values.partyB} />
        </View>
      </Page>

      <Page size="A4" style={styles.page}>
        {bodyBlocks.map((block, index) => {
          switch (block.kind) {
            case "heading":
              return (
                <Text key={index} style={styles.bodyHeading}>
                  <InlineSpans segments={block.inline} />
                </Text>
              );
            case "item":
              return (
                <Text key={index} style={styles.bodyItem}>
                  <Text style={{ fontFamily: "Helvetica-Bold" }}>{block.number}. </Text>
                  <InlineSpans segments={block.inline} />
                </Text>
              );
            case "subitem":
              return (
                <Text key={index} style={styles.bodySubitem}>
                  <Text>{block.marker} </Text>
                  <InlineSpans segments={block.inline} />
                </Text>
              );
            case "footer":
              return (
                <View key={index} style={styles.bodyFooter}>
                  {block.lines.map((line, lineIndex) => (
                    <Text key={lineIndex}>
                      <InlineSpans segments={line} />
                    </Text>
                  ))}
                </View>
              );
            case "paragraph":
              return (
                <Text key={index} style={styles.bodyItem}>
                  <InlineSpans segments={block.inline} />
                </Text>
              );
            default:
              return null;
          }
        })}
      </Page>
    </Document>
  );
}
