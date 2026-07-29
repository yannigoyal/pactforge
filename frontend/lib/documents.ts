import { API_URL } from "@/lib/apiUrl";

export interface DocumentSummary {
  id: number;
  templateId: string;
  title: string;
  updatedAt: string;
}

export interface SavedDocument extends DocumentSummary {
  values: Record<string, unknown>;
}

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed. Please try again.");
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export function listDocuments(token: string): Promise<DocumentSummary[]> {
  return request("/documents", token);
}

export function getDocument(token: string, id: number): Promise<SavedDocument> {
  return request(`/documents/${id}`, token);
}

export function createDocument(
  token: string,
  doc: { templateId: string; title: string; values: unknown },
): Promise<SavedDocument> {
  return request("/documents", token, { method: "POST", body: JSON.stringify(doc) });
}

export function updateDocument(
  token: string,
  id: number,
  doc: { templateId: string; title: string; values: unknown },
): Promise<SavedDocument> {
  return request(`/documents/${id}`, token, { method: "PUT", body: JSON.stringify(doc) });
}

export function deleteDocument(token: string, id: number): Promise<void> {
  return request(`/documents/${id}`, token, { method: "DELETE" });
}
