import type { Party } from "@/lib/templates/party";
import type { DocBlock, InlineSegment } from "@/lib/templates/markdown";
import { formatDate, formatNoticeAddress, formatSignatoryNameAndTitle } from "@/lib/templates/format";

export function Value({ value }: { value: string }) {
  return value ? (
    <span>{value}</span>
  ) : (
    <span className="italic text-slate-400 dark:text-slate-500">Not provided</span>
  );
}

export function KeyTerm({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,10rem)_1fr] gap-2 py-1 text-sm">
      <dt className="font-medium text-slate-600 dark:text-slate-400">{label}</dt>
      <dd className="text-slate-900 dark:text-slate-100">
        <Value value={value} />
      </dd>
    </div>
  );
}

export function PartySignatureBlock({ title, party }: { title: string; party: Party }) {
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

export function InlineText({ segments }: { segments: InlineSegment[] }) {
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

export function DocBody({ blocks }: { blocks: DocBlock[] }) {
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
          case "subsection":
            return (
              <p key={index} className="pl-4">
                <span>{block.number}.</span> <InlineText segments={block.inline} />
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
