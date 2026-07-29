"use client";

import { ndaFormSchema, type NdaFormValues } from "@/lib/nda/schema";
import { defaultNdaFormValues } from "@/lib/nda/defaultValues";
import {
  NDA_OPTIONAL_FIELD_PATH,
  NDA_TEMPLATE_NAME,
  ndaFieldDescriptors,
} from "@/lib/nda/chatDescriptors";
import type { DocBlock } from "@/lib/templates/markdown";
import { DocumentCreator } from "@/components/shared/DocumentCreator";
import { NdaForm } from "./NdaForm";
import { NdaPreview } from "./NdaPreview";

interface NdaCreatorProps {
  bodyBlocks: DocBlock[];
}

async function createNdaPdfBlob(values: NdaFormValues, bodyBlocks: DocBlock[]): Promise<Blob> {
  const [{ pdf }, { NdaPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./NdaPdfDocument"),
  ]);
  return pdf(<NdaPdfDocument values={values} bodyBlocks={bodyBlocks} />).toBlob();
}

function ndaDocumentTitle(values: NdaFormValues): string {
  const parties = [values.partyA.companyName, values.partyB.companyName]
    .filter(Boolean)
    .join(" & ");
  return parties ? `Mutual NDA — ${parties}` : "Mutual NDA";
}

export function NdaCreator({ bodyBlocks }: NdaCreatorProps) {
  return (
    <DocumentCreator
      templateId="bonterms-mutual-nda"
      templateName={NDA_TEMPLATE_NAME}
      documentTitle={ndaDocumentTitle}
      schema={ndaFormSchema}
      defaultValues={defaultNdaFormValues}
      fieldDescriptors={ndaFieldDescriptors}
      optionalFieldPath={NDA_OPTIONAL_FIELD_PATH}
      pdfFileName="bonterms-mutual-nda.pdf"
      bodyBlocks={bodyBlocks}
      renderForm={(register, errors) => <NdaForm register={register} errors={errors} />}
      renderPreview={(values) => <NdaPreview values={values} bodyBlocks={bodyBlocks} />}
      createPdfBlob={createNdaPdfBlob}
    />
  );
}
