"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ndaFormSchema, type NdaFormValues } from "@/lib/nda/schema";
import { defaultNdaFormValues } from "@/lib/nda/defaultValues";
import type { NdaBlock } from "@/lib/nda/markdown";
import { NdaForm } from "./NdaForm";
import { NdaPreview } from "./NdaPreview";

interface NdaCreatorProps {
  bodyBlocks: NdaBlock[];
}

export function NdaCreator({ bodyBlocks }: NdaCreatorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NdaFormValues>({
    resolver: zodResolver(ndaFormSchema),
    defaultValues: defaultNdaFormValues,
    mode: "onTouched",
  });

  const values = watch();

  const onDownload = async (data: NdaFormValues) => {
    setDownloadError(null);
    setIsGenerating(true);
    try {
      const [{ pdf }, { NdaPdfDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./NdaPdfDocument"),
      ]);
      const blob = await pdf(
        <NdaPdfDocument values={data} bodyBlocks={bodyBlocks} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bonterms-mutual-nda.pdf";
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
      <NdaForm register={register} errors={errors} />

      <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <NdaPreview values={values} bodyBlocks={bodyBlocks} />

        <div className="flex flex-col gap-2">
          <button
            type="submit"
            disabled={isGenerating}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating PDF…" : "Download PDF"}
          </button>
          {downloadError ? (
            <p role="alert" className="text-sm text-red-600">
              {downloadError}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
