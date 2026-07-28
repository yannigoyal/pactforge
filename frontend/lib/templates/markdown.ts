import { readFile } from "node:fs/promises";
import path from "node:path";

export interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
  href?: string;
}

export type DocBlock =
  | { kind: "heading"; inline: InlineSegment[] }
  | { kind: "item"; number: string; inline: InlineSegment[] }
  | { kind: "subsection"; number: string; inline: InlineSegment[] }
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

/**
 * Parses the fixed markdown structure shared by the Bonterms agreements into renderable
 * blocks. Handles both shapes in the catalog: the Mutual NDA (`1. text`, `- (a) text`,
 * trailing footer) and the PSA (`**1.\tTitle**. text`, `2.1.\ttext`, bare `(a)\ttext`).
 * This parser is tailored to these templates, not general-purpose markdown.
 */
export function parseAgreementBody(markdown: string): DocBlock[] {
  const blocks = markdown
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  return blocks.map((block): DocBlock => {
    if (block.startsWith("# ")) {
      return { kind: "heading", inline: parseInline(block.slice(2)) };
    }

    const boldItemMatch = block.match(/^\*\*(\d+)\.\s+([^*]+)\*\*\.?\s*([\s\S]*)$/);
    if (boldItemMatch) {
      const inline: InlineSegment[] = [{ text: `${boldItemMatch[2].trim()}.`, bold: true }];
      if (boldItemMatch[3].trim()) {
        inline.push({ text: " " }, ...parseInline(boldItemMatch[3]));
      }
      return { kind: "item", number: boldItemMatch[1], inline };
    }

    const subsectionMatch = block.match(/^(\d+\.\d+)\.\s+([\s\S]*)$/);
    if (subsectionMatch) {
      return { kind: "subsection", number: subsectionMatch[1], inline: parseInline(subsectionMatch[2]) };
    }

    const itemMatch = block.match(/^(\d+)\.\s+([\s\S]*)$/);
    if (itemMatch) {
      const text = itemMatch[2].trim();
      // A title-only section without markup (e.g. the PSA's "4.\tCommunication and
      // Escalation.", the one upstream section not wrapped in **) renders bold so it
      // matches its sibling section headings.
      if (!text.includes("**") && /^[A-Z][^.]*\.$/.test(text)) {
        return { kind: "item", number: itemMatch[1], inline: [{ text, bold: true }] };
      }
      return { kind: "item", number: itemMatch[1], inline: parseInline(text) };
    }

    const subitemMatch = block.match(/^(?:-\s+)?\(([a-z])\)\s+([\s\S]*)$/);
    if (subitemMatch) {
      return {
        kind: "subitem",
        marker: `(${subitemMatch[1]})`,
        inline: parseInline(subitemMatch[2]),
      };
    }

    if (/^Bonterms .+\(Version/.test(block)) {
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

/** Reads a template's canonical markdown from templates/, the single source of truth shared with the catalog. */
export async function loadTemplateMarkdown(catalogPath: string): Promise<string> {
  const filePath = path.join(process.cwd(), "..", "templates", catalogPath);
  return readFile(filePath, "utf-8");
}
