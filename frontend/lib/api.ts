export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** Shared JSON fetch helper: prefixes API_URL, sends/parses JSON, and throws the
 * backend's `detail` message (or the fallback) on non-2xx responses. */
export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
  fallbackError = "Request failed. Please try again.",
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const detail = body?.detail;
    throw new Error(typeof detail === "string" ? detail : fallbackError);
  }
  return res.status === 204 ? (undefined as T) : res.json();
}
