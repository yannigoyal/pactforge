import type { FieldPath, UseFormSetValue } from "react-hook-form";
import { API_URL } from "@/lib/apiUrl";
import type { NdaFormValues } from "./schema";
import type { NextField } from "./chatFields";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  reply: string;
  extractedFields: Record<string, unknown>;
}

export async function sendChatMessage(
  messages: ChatMessage[],
  fields: NdaFormValues,
  nextField: NextField | null,
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/chat/nda`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, fields, nextField }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? "The AI assistant is unavailable right now.");
  }

  return res.json();
}

export function applyExtractedFields(
  setValue: UseFormSetValue<NdaFormValues>,
  extracted: Record<string, unknown>,
) {
  for (const [key, value] of Object.entries(extracted)) {
    if (key === "partyA" || key === "partyB") {
      for (const [partyKey, partyValue] of Object.entries(value as Record<string, unknown>)) {
        setValue(`${key}.${partyKey}` as FieldPath<NdaFormValues>, partyValue as string, {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      setValue(key as FieldPath<NdaFormValues>, value as string, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }
}
