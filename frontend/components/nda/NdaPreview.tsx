import type { NdaFormValues } from "@/lib/nda/schema";
import type { DocBlock } from "@/lib/templates/markdown";
import { formatDate } from "@/lib/templates/format";
import { DocBody, KeyTerm, PartySignatureBlock } from "@/components/shared/previewParts";

interface NdaPreviewProps {
  values: NdaFormValues;
  bodyBlocks: DocBlock[];
}

export function NdaPreview({ values, bodyBlocks }: NdaPreviewProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Cover Page for Bonterms Mutual NDA
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          By executing this Cover Page, the parties enter into the Bonterms Mutual NDA (Version 1.0). This
          Cover Page controls over directly conflicting provisions of the Bonterms Mutual NDA.
        </p>
      </div>

      <dl className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        <KeyTerm label="Purpose" value={values.purpose} />
        <KeyTerm label="Effective Date" value={formatDate(values.effectiveDate)} />
        <KeyTerm label="Term of NDA" value={values.termOfNda} />
        <KeyTerm label="Confidentiality Period" value={values.confidentialityPeriod} />
        <KeyTerm label="Governing Law" value={values.governingLaw} />
        <KeyTerm label="Courts" value={values.courts} />
      </dl>

      {values.additionalTerms ? (
        <div className="text-sm">
          <p className="font-medium text-slate-600 dark:text-slate-400">Additional Terms</p>
          <p className="whitespace-pre-wrap text-slate-900 dark:text-slate-100">{values.additionalTerms}</p>
        </div>
      ) : null}

      <div className="grid gap-6 border-t border-slate-100 pt-4 sm:grid-cols-2 dark:border-slate-800">
        <PartySignatureBlock title="Party 1" party={values.partyA} />
        <PartySignatureBlock title="Party 2" party={values.partyB} />
      </div>

      <DocBody blocks={bodyBlocks} />
    </div>
  );
}
