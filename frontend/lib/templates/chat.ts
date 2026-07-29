import type { FieldPath, FieldValues, UseFormSetValue } from "react-hook-form";
import { apiRequest } from "@/lib/api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/** Describes one extractable field of a template, used for both the chat's "next
 * question" labels and the backend's dynamically built extraction schema. */
export interface FieldDescriptor {
  path: string;
  label: string;
  options?: string[];
}

export interface NextField {
  path: string;
  label: string;
}

interface ChatResponse {
  reply: string;
  extractedFields: Record<string, unknown>;
}

export function sendChatMessage(
  templateName: string,
  fieldDescriptors: FieldDescriptor[],
  messages: ChatMessage[],
  fields: FieldValues,
  nextField: NextField | null,
): Promise<ChatResponse> {
  return apiRequest(
    "/chat",
    {
      method: "POST",
      body: JSON.stringify({ templateName, fieldDescriptors, messages, fields, nextField }),
    },
    "The AI assistant is unavailable right now.",
  );
}

/** Walks the (possibly nested) extracted-fields object and writes each leaf string
 * onto the form, so the preview and form inputs update immediately. */
export function applyExtractedFields<T extends FieldValues>(
  setValue: UseFormSetValue<T>,
  extracted: Record<string, unknown>,
  prefix = "",
) {
  for (const [key, value] of Object.entries(extracted)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      setValue(fieldPath as FieldPath<T>, value as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else if (value && typeof value === "object") {
      applyExtractedFields(setValue, value as Record<string, unknown>, fieldPath);
    }
  }
}
