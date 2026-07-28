"use client";

import { useState, type ReactNode } from "react";
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
import { DocChat } from "./DocChat";

interface DocumentCreatorProps<T extends FieldValues> {
  templateName: string;
  schema: ZodType<T, T>;
  defaultValues: DefaultValues<T>;
  fieldDescriptors: FieldDescriptor[];
  optionalFieldPath?: string;
  pdfFileName: string;
  bodyBlocks: DocBlock[];
  renderForm: (register: UseFormRegister<T>, errors: FieldErrors<T>) => ReactNode;
  renderPreview: (values: T) => ReactNode;
  /** Builds the PDF blob; implementations dynamically import @react-pdf/renderer and
   * the template's PDF document here to keep them out of the initial client bundle. */
  createPdfBlob: (values: T, bodyBlocks: DocBlock[]) => Promise<Blob>;
}

export function DocumentCreator<T extends FieldValues>({
  templateName,
  schema,
  defaultValues,
  fieldDescriptors,
  optionalFieldPath,
  pdfFileName,
  bodyBlocks,
  renderForm,
  renderPreview,
  createPdfBlob,
}: DocumentCreatorProps<T>) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: "onTouched",
  });

  const values = watch();

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
          <button
            type="submit"
            disabled={isGenerating || !isValid}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
          >
            {isGenerating ? "Generating PDF…" : "Download PDF"}
          </button>
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
