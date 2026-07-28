import type { PsaFormValues } from "@/lib/psa/schema";
import type { DocBlock } from "@/lib/templates/markdown";
import { formatDate } from "@/lib/templates/format";
import { DocBody, KeyTerm, PartySignatureBlock } from "@/components/shared/previewParts";

interface PsaPreviewProps {
  values: PsaFormValues;
  bodyBlocks: DocBlock[];
}

export function PsaPreview({ values, bodyBlocks }: PsaPreviewProps) {
  return (
    <div className="flex flex-col gap-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Cover Page for Bonterms Professional Services Agreement
        </h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          By executing this Cover Page, Customer and Provider enter into the Bonterms Professional
          Services Agreement (Version 1.2). This Cover Page controls over directly conflicting
          provisions of the Bonterms Professional Services Agreement.
        </p>
      </div>

      <dl className="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
        <KeyTerm label="Effective Date" value={formatDate(values.effectiveDate)} />
        <KeyTerm label="Rights in Deliverables" value={values.rightsInDeliverables} />
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
        <PartySignatureBlock title="Customer" party={values.customer} />
        <PartySignatureBlock title="Provider" party={values.provider} />
      </div>

      <DocBody blocks={bodyBlocks} />
    </div>
  );
}
