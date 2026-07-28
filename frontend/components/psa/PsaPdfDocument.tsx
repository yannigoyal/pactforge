import { Document, Page, Text, View } from "@react-pdf/renderer";
import type { PsaFormValues } from "@/lib/psa/schema";
import type { DocBlock } from "@/lib/templates/markdown";
import { formatDate } from "@/lib/templates/format";
import { PdfDocBody, PdfPartyBlock, TermRow, pdfStyles } from "@/components/shared/pdfParts";

interface PsaPdfDocumentProps {
  values: PsaFormValues;
  bodyBlocks: DocBlock[];
}

export function PsaPdfDocument({ values, bodyBlocks }: PsaPdfDocumentProps) {
  return (
    <Document title="Bonterms Professional Services Agreement">
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Cover Page for Bonterms Professional Services Agreement</Text>
        <Text style={pdfStyles.intro}>
          By executing this Cover Page, Customer and Provider enter into the Bonterms Professional
          Services Agreement (Version 1.2). This Cover Page controls over directly conflicting
          provisions of the Bonterms Professional Services Agreement.
        </Text>

        <Text style={pdfStyles.sectionLabel}>Key Terms</Text>
        <TermRow label="Effective Date" value={formatDate(values.effectiveDate)} />
        <TermRow label="Rights in Deliverables" value={values.rightsInDeliverables} />
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
          <PdfPartyBlock title="Customer" party={values.customer} />
          <PdfPartyBlock title="Provider" party={values.provider} />
        </View>
      </Page>

      <Page size="A4" style={pdfStyles.page}>
        <PdfDocBody blocks={bodyBlocks} />
      </Page>
    </Document>
  );
}
