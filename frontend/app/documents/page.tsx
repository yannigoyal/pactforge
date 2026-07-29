"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { deleteDocument, listDocuments, type DocumentSummary } from "@/lib/documents";

function formatUpdatedAt(iso: string): string {
  const parsed = new Date(iso.endsWith("Z") ? iso : `${iso}Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DocumentsPage() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const [documents, setDocuments] = useState<DocumentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    listDocuments(token)
      .then(setDocuments)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load documents."));
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!token) return;
    try {
      await deleteDocument(token, id);
      setDocuments((docs) => docs?.filter((doc) => doc.id !== id) ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete document.");
    }
  };

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-6 py-10">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">My documents</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Documents you save reopen right where you left off — form, chat, and preview included.
        </p>
      </header>

      {isAuthLoading ? null : !token ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            <Link
              href="/signin"
              className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
            >
              Sign in
            </Link>{" "}
            to see your saved documents.
          </p>
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : documents === null ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading…</p>
      ) : documents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            No saved documents yet.{" "}
            <Link
              href="/"
              className="font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
            >
              Pick a template
            </Link>{" "}
            and click Save to keep your work.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          {documents.map((doc) => (
            <li key={doc.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <Link
                  href={`/create/${doc.templateId}?doc=${doc.id}`}
                  className="block truncate text-sm font-medium text-slate-900 underline-offset-2 hover:underline dark:text-slate-100"
                >
                  {doc.title}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Updated {formatUpdatedAt(doc.updatedAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                className="shrink-0 text-sm text-slate-500 underline-offset-2 hover:text-red-600 hover:underline dark:text-slate-400 dark:hover:text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
