import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NdaCreator } from "@/components/nda/NdaCreator";
import { PsaCreator } from "@/components/psa/PsaCreator";
import { findCatalogEntry, loadCatalog } from "@/lib/templates/catalog";
import { loadTemplateMarkdown, parseAgreementBody, type DocBlock } from "@/lib/templates/markdown";

interface CreatePageProps {
  params: Promise<{ templateId: string }>;
}

export async function generateStaticParams() {
  const templates = await loadCatalog();
  return templates.map((template) => ({ templateId: template.id }));
}

function creatorFor(templateId: string, bodyBlocks: DocBlock[]) {
  switch (templateId) {
    case "bonterms-mutual-nda":
      return <NdaCreator bodyBlocks={bodyBlocks} />;
    case "bonterms-professional-services-agreement":
      return <PsaCreator bodyBlocks={bodyBlocks} />;
    default:
      return null;
  }
}

export default async function CreatePage({ params }: CreatePageProps) {
  const { templateId } = await params;
  const entry = await findCatalogEntry(templateId);
  if (!entry) notFound();

  const markdown = await loadTemplateMarkdown(entry.path);
  const bodyBlocks = parseAgreementBody(markdown);

  const creator = creatorFor(templateId, bodyBlocks);
  if (!creator) notFound();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{entry.name}</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Fill in the details below through the chat or the form to generate a {entry.name} (Version{" "}
          {entry.version}), preview it live, and download the finished agreement as a PDF.
        </p>
      </header>
      {/* Suspense is required for useSearchParams (the ?doc= reopen flow) on a statically
          prerendered route. */}
      <Suspense>{creator}</Suspense>
    </main>
  );
}
