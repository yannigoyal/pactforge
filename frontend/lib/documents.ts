import { apiRequest } from "@/lib/api";

export interface DocumentSummary {
  id: number;
  templateId: string;
  title: string;
  updatedAt: string;
}

export interface SavedDocument extends DocumentSummary {
  values: Record<string, unknown>;
}

function authed(token: string, init?: RequestInit): RequestInit {
  return { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } };
}

export function listDocuments(token: string): Promise<DocumentSummary[]> {
  return apiRequest("/documents", authed(token));
}

export function getDocument(token: string, id: number): Promise<SavedDocument> {
  return apiRequest(`/documents/${id}`, authed(token));
}

export function createDocument(
  token: string,
  doc: { templateId: string; title: string; values: unknown },
): Promise<SavedDocument> {
  return apiRequest("/documents", authed(token, { method: "POST", body: JSON.stringify(doc) }));
}

export function updateDocument(
  token: string,
  id: number,
  doc: { templateId: string; title: string; values: unknown },
): Promise<SavedDocument> {
  return apiRequest(`/documents/${id}`, authed(token, { method: "PUT", body: JSON.stringify(doc) }));
}

export function deleteDocument(token: string, id: number): Promise<void> {
  return apiRequest(`/documents/${id}`, authed(token, { method: "DELETE" }));
}
