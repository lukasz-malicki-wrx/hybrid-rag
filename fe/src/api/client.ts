import { API_URL } from "@/lib/config";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Turns an error response into an ApiError carrying the API's own message. */
export async function toApiError(res: Response): Promise<ApiError> {
  let message = res.statusText || `Request failed (${res.status})`;
  try {
    const body = await res.json();
    if (typeof body?.detail === "string") message = body.detail;
    else if (Array.isArray(body?.detail) && body.detail[0]?.msg) message = body.detail[0].msg;
  } catch {
    // not JSON: keep the status text
  }
  return new ApiError(res.status, message);
}

export const apiUrl = (path: string) => `${API_URL}${path}`;

export function query(params: Record<string, string | number | boolean | null | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null);
  return entries.length ? `?${new URLSearchParams(entries.map(([k, v]) => [k, String(v)]))}` : "";
}

/** JSON request to the API; throws ApiError for non-2xx responses. */
export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const isJson = typeof init.body === "string";
  const res = await fetch(apiUrl(path), {
    ...init,
    headers: { ...(isJson ? { "content-type": "application/json" } : {}), ...init.headers },
  });
  if (!res.ok) throw await toApiError(res);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const isNotFound = (error: unknown) => error instanceof ApiError && error.status === 404;
