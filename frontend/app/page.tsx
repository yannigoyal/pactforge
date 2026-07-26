import { NdaCreator } from "@/components/nda/NdaCreator";
import { loadNdaBodyMarkdown, parseNdaBody } from "@/lib/nda/markdown";

export default async function Home() {
  const markdown = await loadNdaBodyMarkdown();
  const bodyBlocks = parseNdaBody(markdown);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Mutual NDA Creator</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fill in the details below to generate a Bonterms Mutual NDA (Version 1.0), preview it live, and
          download the finished agreement as a PDF.
        </p>
      </header>
      <NdaCreator bodyBlocks={bodyBlocks} />
    </main>
  );
}
