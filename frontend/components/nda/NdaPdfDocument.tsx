import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { NdaFormValues } from "@/lib/nda/schema";
import type { DocBlock } from "@/lib/templates/markdown";
import { formatDate } from "@/lib/templates/format";
import { PdfDocBody, PdfPartyBlock, TermRow, pdfStyles } from "@/components/shared/pdfParts";

interface NdaPdfDocumentProps {
  values: NdaFormValues;
  bodyBlocks: DocBlock[];
}

export function NdaPdfDocument({ values, bodyBlocks }: NdaPdfDocumentProps) {
  return (
    <Document title="Bonterms Mutual NDA">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Cover Page for Bonterms Mutual NDA</Text>
        <Text style={pdfStyles.intro}>
          By executing this Cover Page, the parties enter into the Bonterms Mutual NDA (Version 1.0). This
          Cover Page controls over directly conflicting provisions of the Bonterms Mutual NDA.
        </Text>

        <Text style={pdfStyles.sectionLabel}>Key Terms</Text>
        <TermRow label="Purpose" value={values.purpose} />
        <TermRow label="Effective Date" value={formatDate(values.effectiveDate)} />
        <TermRow label="Term of NDA" value={values.termOfNda} />
        <TermRow label="Confidentiality Period" value={values.confidentialityPeriod} />
        <TermRow label="Governing Law" value={values.governingLaw} />
        <TermRow label="Courts" value={values.courts} />

        {values.additionalTerms ? (
          <>
            <Text style={pdfStyles.sectionLabel}>Additional Terms</Text>
            <Text>{values.additionalTerms}</Text>
          </>
        ) : null}

        <Text style={pdfStyles.sectionLabel}>Signatures</Text>
        <View style={pdfStyles.partiesRow}>
          <PdfPartyBlock title="Party 1" party={values.partyA} />
          <PdfPartyBlock title="Party 2" party={values.partyB} />
        </View>
      </Page>

      <Page size="A4" style={pdfStyles.page}>
        <PdfDocBody blocks={bodyBlocks} />
      </Page>
    </Document>
  );
}
