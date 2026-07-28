import type { NdaFormValues, NdaParty } from "@/lib/nda/schema";
import type { InlineSegment, NdaBlock } from "@/lib/nda/markdown";
import { formatDate, formatNoticeAddress, formatSignatoryNameAndTitle } from "@/lib/nda/format";

interface NdaPreviewProps {
  values: NdaFormValues;
  bodyBlocks: NdaBlock[];
}

function Value({ value }: { value: string }) {
  return value ? (
    <span>{value}</span>
  ) : (
    <span className="italic text-slate-400 dark:text-slate-500">Not provided</span>
  );
}

function KeyTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-2 py-1 text-sm">
      <dt className="font-medium text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-slate-900 dark:text-slate-100">
        <Value value={value} />
      </dd>
    </div>
  );
}

function PartySignatureBlock({ title, party }: { title: string; party: NdaParty }) {
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="font-medium text-slate-600 dark:text-slate-400">{title}</p>
      <p>
        Party Name: <Value value={party.companyName} />
      </p>
      <p>
        Signature:{" "}
        {party.signature ? (
          <span className="font-serif italic">{party.signature}</span>
        ) : (
          <Value value="" />
        )}
      </p>
      <p>
        Name and Title: <Value value={formatSignatoryNameAndTitle(party)} />
      </p>
      <p>
        Notice Address: <Value value={formatNoticeAddress(party)} />
      </p>
      <p>
        Date: <Value value={formatDate(party.date)} />
      </p>
    </div>
  );
}

function InlineText({ segments }: { segments: InlineSegment[] }) {
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.href) {
          return (
            <a
              key={index}
              href={segment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-700 underline hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100"
            >
              {segment.text}
            </a>
          );
        }
        if (segment.bold) return <strong key={index}>{segment.text}</strong>;
        if (segment.italic) return <em key={index}>{segment.text}</em>;
        return <span key={index}>{segment.text}</span>;
      })}
    </>
  );
}

function NdaBody({ blocks }: { blocks: NdaBlock[] }) {
  return (
    <div className="flex flex-col gap-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {blocks.map((block, index) => {
        switch (block.kind) {
          case "heading":
            return (
              <h3 key={index} className="text-center text-base font-semibold text-slate-900 dark:text-slate-100">
                <InlineText segments={block.inline} />
              </h3>
            );
          case "item":
            return (
              <p key={index}>
                <span className="font-semibold">{block.number}.</span>{" "}
                <InlineText segments={block.inline} />
              </p>
            );
          case "subitem":
            return (
              <p key={index} className="pl-6">
                <span>{block.marker}</span> <InlineText segments={block.inline} />
              </p>
            );
          case "footer":
            return (
              <div
                key={index}
                className="mt-2 border-t border-slate-200 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400"
              >
                {block.lines.map((line, lineIndex) => (
                  <p key={lineIndex}>
                    <InlineText segments={line} />
                  </p>
                ))}
              </div>
            );
          case "paragraph":
            return (
              <p key={index}>
                <InlineText segments={block.inline} />
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
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

      <NdaBody blocks={bodyBlocks} />
    </div>
  );
}
