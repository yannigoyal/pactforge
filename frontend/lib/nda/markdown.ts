import { readFile } from "node:fs/promises";
import path from "node:path";

export interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export type NdaBlock =
  | { kind: "heading"; inline: InlineSegment[] }
  | { kind: "item"; number: string; inline: InlineSegment[] }
  | { kind: "subitem"; marker: string; inline: InlineSegment[] }
  | { kind: "footer"; lines: InlineSegment[][] }
  | { kind: "paragraph"; inline: InlineSegment[] };

const INLINE_TOKEN = /(\*\*[^*]+\*\*|_[^_]+_|\[[^\]]+\]\([^)]+\))/g;
const LINK_PATTERN = /^\[([^\]]+)\]\(([^)]+)\)$/;

function parseInline(raw: string): InlineSegment[] {
  const normalized = raw.replace(/\s+/g, " ").trim();
  return normalized
    .split(INLINE_TOKEN)
    .filter((part) => part.length > 0)
    .map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return { text: part.slice(2, -2), bold: true };
      }
      if (part.startsWith("_") && part.endsWith("_")) {
        return { text: part.slice(1, -1), italic: true };
      }
      const linkMatch = part.match(LINK_PATTERN);
      if (linkMatch) {
        return { text: linkMatch[1], href: linkMatch[2] };
      }
      return { text: part };
    });
}

/** Parses the fixed markdown structure of the Bonterms Mutual NDA body into renderable blocks. */
export function parseNdaBody(markdown: string): NdaBlock[] {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return blocks.map((block): NdaBlock => {
    if (block.startsWith("# ")) {
      return { kind: "heading", inline: parseInline(block.slice(2)) };
    }

    const itemMatch = block.match(/^(\d+)\.\s+([\s\S]*)$/);
    if (itemMatch) {
      return { kind: "item", number: itemMatch[1], inline: parseInline(itemMatch[2]) };
    }

    const subitemMatch = block.match(/^-\s+\(([a-z])\)\s+([\s\S]*)$/);
    if (subitemMatch) {
      return {
        kind: "subitem",
        marker: `(${subitemMatch[1]})`,
        inline: parseInline(subitemMatch[2]),
      };
    }

    if (block.startsWith("Bonterms Mutual NDA (Version")) {
      const lines = block
        .split(/<br\s*\/?>/i)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map(parseInline);
      return { kind: "footer", lines };
    }

    return { kind: "paragraph", inline: parseInline(block) };
  });
}

/** Reads the canonical Mutual NDA markdown from templates/, the single source of truth shared with the catalog. */
export async function loadNdaBodyMarkdown(): Promise<string> {
  const filePath = path.join(
    process.cwd(),
    "..",
    "templates",
    "bonterms-mutual-nda",
    "Mutual-NDA.md",
  );
  return readFile(filePath, "utf-8");
}
