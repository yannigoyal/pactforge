"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useForm,
  type DefaultValues,
  type FieldErrors,
  type FieldValues,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodType } from "zod";
import type { DocBlock } from "@/lib/templates/markdown";
import type { FieldDescriptor } from "@/lib/templates/chat";
import { useAuth } from "@/lib/auth";
import { createDocument, getDocument, updateDocument } from "@/lib/documents";
import { DocChat } from "./DocChat";

interface DocumentCreatorProps<T extends FieldValues> {
  templateId: string;
  templateName: string;
  schema: ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  fieldDescriptors: FieldDescriptor[];
  optionalFieldPath?: string;
  pdfFileName: string;
  bodyBlocks: DocBlock[];
  /** Title stored with a saved document, derived from the current values. */
  documentTitle: (values: T) => string;
  renderForm: (register: UseFormRegister<T>, errors: FieldErrors<T>) => ReactNode;
  renderPreview: (values: T) => ReactNode;
  /** Builds the PDF blob; implementations dynamically import @react-pdf/renderer and
   * the template's PDF document here to keep them out of the initial client bundle. */
  createPdfBlob: (values: T, bodyBlocks: DocBlock[]) => Promise<Blob>;
}

type SaveState = "idle" | "saving" | "saved" | "error";

export function DocumentCreator<T extends FieldValues>({
  templateId,
  templateName,
  schema,
  defaultValues,
  fieldDescriptors,
  optionalFieldPath,
  pdfFileName,
  bodyBlocks,
  documentTitle,
  renderForm,
  renderPreview,
  createPdfBlob,
}: DocumentCreatorProps<T>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [savedDocId, setSavedDocId] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveError, setSaveError] = useState<string | null>(null);

  const requestedDocId = searchParams.get("doc");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const values = watch();

  // Reopen a saved document: load its values into the form once auth is ready.
  useEffect(() => {
    if (!requestedDocId || isAuthLoading) return;
    if (!token) {
      setSaveError("Sign in to load this saved document.");
      return;
    }
    let cancelled = false;
    getDocument(token, Number(requestedDocId))
      .then((doc) => {
        if (cancelled) return;
        if (doc.templateId !== templateId) {
          setSaveError("This saved document belongs to a different template.");
          return;
        }
        reset(doc.values as DefaultValues<T>, { keepDefaultValues: true });
        setSavedDocId(doc.id);
      })
      .catch((err) => {
        if (!cancelled) {
          setSaveError(err instanceof Error ? err.message : "Failed to load the saved document.");
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedDocId, token, isAuthLoading]);

  const onSave = async () => {
    if (!token) {
      router.push("/signin");
      return;
    }
    setSaveError(null);
    setSaveState("saving");
    const doc = {
      templateId,
      title: documentTitle(getValues()),
      values: getValues(),
    };
    try {
      if (savedDocId) {
        await updateDocument(token, savedDocId, doc);
      } else {
        const created = await createDocument(token, doc);
        setSavedDocId(created.id);
        router.replace(`/create/${templateId}?doc=${created.id}`, { scroll: false });
      }
      setSaveState("saved");
    } catch (err) {
      setSaveState("error");
      setSaveError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    }
  };

  const onDownload = async (data: T) => {
    setDownloadError(null);
    setIsGenerating(true);
    try {
      const blob = await createPdfBlob(data, bodyBlocks);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfFileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Something went wrong generating the PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onDownload)} className="grid gap-8 lg:grid-cols-2">
      <div className="flex flex-col gap-6">
        <DocChat
          templateName={templateName}
          schema={schema}
          fieldDescriptors={fieldDescriptors}
          optionalFieldPath={optionalFieldPath}
          values={values}
          setValue={setValue}
        />
        {renderForm(register, errors)}
      </div>

      <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        {renderPreview(values)}

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isGenerating || !isValid}
              className="flex-1 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              {isGenerating ? "Generating PDF…" : "Download PDF"}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saveState === "saving"}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:border-slate-500"
            >
              {saveState === "saving"
                ? "Saving…"
                : token
                  ? savedDocId
                    ? "Save changes"
                    : "Save"
                  : "Sign in to save"}
            </button>
          </div>
          {saveState === "saved" ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
              Saved to your documents.
            </p>
          ) : null}
          {saveError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {saveError}
            </p>
          ) : null}
          {downloadError ? (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {downloadError}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
