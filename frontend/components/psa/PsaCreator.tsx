"use client";

import { psaFormSchema, type PsaFormValues } from "@/lib/psa/schema";
import { defaultPsaFormValues } from "@/lib/psa/defaultValues";
import {
  PSA_OPTIONAL_FIELD_PATH,
  PSA_TEMPLATE_NAME,
  psaFieldDescriptors,
} from "@/lib/psa/chatDescriptors";
import type { DocBlock } from "@/lib/templates/markdown";
import { DocumentCreator } from "@/components/shared/DocumentCreator";
import { PsaForm } from "./PsaForm";
import { PsaPreview } from "./PsaPreview";

interface PsaCreatorProps {
  bodyBlocks: DocBlock[];
}

async function createPsaPdfBlob(values: PsaFormValues, bodyBlocks: DocBlock[]): Promise<Blob> {
  const [{ pdf }, { PsaPdfDocument }] = await Promise.all([
    import("@react-pdf/renderer"),
    import("./PsaPdfDocument"),
  ]);
  return pdf(<PsaPdfDocument values={values} bodyBlocks={bodyBlocks} />).toBlob();
}

export function PsaCreator({ bodyBlocks }: PsaCreatorProps) {
  return (
    <DocumentCreator
      templateName={PSA_TEMPLATE_NAME}
      schema={psaFormSchema}
      defaultValues={defaultPsaFormValues}
      fieldDescriptors={psaFieldDescriptors}
      optionalFieldPath={PSA_OPTIONAL_FIELD_PATH}
      pdfFileName="bonterms-professional-services-agreement.pdf"
      bodyBlocks={bodyBlocks}
      renderForm={(register, errors) => <PsaForm register={register} errors={errors} />}
      renderPreview={(values) => <PsaPreview values={values} bodyBlocks={bodyBlocks} />}
      createPdfBlob={createPsaPdfBlob}
    />
  );
}
