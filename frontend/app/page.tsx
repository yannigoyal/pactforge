import Link from "next/link";
import { loadCatalog } from "@/lib/templates/catalog";

export default async function Home() {
  const templates = await loadCatalog();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">pactForge</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Choose a document type to get started. Fill in the details through an AI chat or a form,
          preview the agreement live, and download it as a PDF.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => (
          <Link
            key={template.id}
            href={`/create/${template.id}`}
            className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-400 hover:shadow dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {template.category}
            </span>
            <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {template.name}
            </span>
            <span className="text-sm text-slate-600 dark:text-slate-400">{template.description}</span>
            <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Version {template.version} · {template.license.name}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
