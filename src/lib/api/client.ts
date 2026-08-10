import type { ApiErrorBody } from "./responses";

// Returns a result rather than throwing, so components handle failure as a value
// and field errors stay typed down to the input that renders them.
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; message: string; fields?: Record<string, string[]> };

export async function apiPost<T>(
  path: string,
  body: unknown,
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(body),
    });
  } catch {
    return { ok: false, message: "Could not reach the server. Check your connection." };
  }

  if (response.status === 204) {
    return { ok: true, data: undefined as T };
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = (payload as ApiErrorBody | null)?.error;
    return {
      ok: false,
      message: error?.message ?? "Something went wrong",
      fields: error?.fields,
    };
  }

  return { ok: true, data: payload as T };
}
