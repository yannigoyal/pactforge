import type { FieldPath, FieldValues, UseFormSetValue } from "react-hook-form";
import { API_URL } from "@/lib/apiUrl";

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

export async function sendChatMessage(
  templateName: string,
  fieldDescriptors: FieldDescriptor[],
  messages: ChatMessage[],
  fields: FieldValues,
  nextField: NextField | null,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateName, fieldDescriptors, messages, fields, nextField }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "The AI assistant is unavailable right now.");
  }

  return res.json();
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
