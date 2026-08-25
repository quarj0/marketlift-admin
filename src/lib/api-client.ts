function resolveApiBaseUrl() {
  const defaultApiBase = process.env.NODE_ENV === "production"
    ? "https://api.marketlift.com"
    : "http://localhost:8000";
  const raw = (process.env.NEXT_PUBLIC_MARKETLIFT_API_URL || defaultApiBase).replace(/\/+$/, "");
  if (typeof window === "undefined") return raw;

  try {
    const url = new URL(raw);
    const browserHost = window.location.hostname;
    const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

    if (loopbackHosts.has(url.hostname) && loopbackHosts.has(browserHost)) {
      url.hostname = browserHost;
      return url.toString().replace(/\/+$/, "");
    }
  } catch {
    // Let fetch surface an invalid explicitly configured URL normally.
  }

  return raw;
}

export const API_BASE_URL = resolveApiBaseUrl();

export class MarketliftApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status = 500, code?: string, details?: unknown) {
    super(message);
    this.name = "MarketliftApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function cookie(name: string) {
  if (typeof document === "undefined") return "";
  const found = document.cookie.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`));
  return found ? decodeURIComponent(found.slice(name.length + 1)) : "";
}

export async function ensureCsrfToken() {
  if (typeof window === "undefined") return "";
  const existing = cookie("csrftoken");
  if (existing) return existing;
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/csrf/`, { credentials: "include", cache: "no-store" });
  if (!response.ok) throw new MarketliftApiError("Could not initialize a secure session.", response.status);
  const body = await response.json().catch(() => ({})) as { csrfToken?: string };
  return cookie("csrftoken") || body.csrfToken || "";
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const token = await ensureCsrfToken();
    if (token) headers.set("X-CSRFToken", token);
  }
  const response = await fetch(`${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    method,
    headers,
    credentials: "include",
    cache: "no-store",
  });
  if (response.status === 204) return undefined as T;
  const body = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    const detail = typeof body.detail === "string" ? body.detail : `Request failed (${response.status}).`;
    throw new MarketliftApiError(detail, response.status);
  }
  return body as T;
}

type GraphQLError = { message?: string; extensions?: { code?: string; status?: number; details?: unknown } };
type GraphQLResponse<T> = { data?: T; errors?: GraphQLError[] };

export async function graphqlRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const token = await ensureCsrfToken();
  const response = await fetch(`${API_BASE_URL}/graphql/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-CSRFToken": token } : {}) },
    credentials: "include",
    cache: "no-store",
    body: JSON.stringify({ query, variables }),
  });
  const body = await response.json().catch(() => ({})) as GraphQLResponse<T>;
  const first = body.errors?.[0];
  if (!response.ok || first || !body.data) {
    throw new MarketliftApiError(
      first?.message || `Request failed (${response.status}).`,
      first?.extensions?.status || response.status || 500,
      first?.extensions?.code,
      first?.extensions?.details,
    );
  }
  return body.data;
}
