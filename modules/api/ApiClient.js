export class ApiError extends Error {
  constructor(message, { status = 0, code = null, details = null, kind = "http" } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.kind = kind;
  }

  get isUnauthorized() { return this.status === 401; }
  get isValidationError() { return this.status === 422; }
  get isCancelled() { return this.kind === "cancelled"; }
  get isConnectionError() { return this.kind === "connection"; }
}

const DEFAULT_API_URL = "http://localhost:8000/api";

function normalizeBaseUrl(baseUrl) {
  return String(baseUrl || DEFAULT_API_URL).replace(/\/+$/, "");
}

export class ApiClient {
  constructor(baseUrl = globalThis.MALPARIDITOS_API_URL || DEFAULT_API_URL) {
    this.baseUrl = normalizeBaseUrl(baseUrl);
    this.token = null;
  }

  setToken(token) {
    this.token = token || null;
    return this;
  }

  clearToken() {
    this.token = null;
    return this;
  }

  async get(path, { signal, query = {} } = {}) {
    const url = new URL(`${this.baseUrl}/${String(path).replace(/^\/+/, "")}`);
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });
    return this.request(url, { signal });
  }

  async request(url, { signal } = {}) {
    const headers = { Accept: "application/json" };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;

    try {
      const response = await fetch(url, { method: "GET", headers, signal });
      const payload = await this.parseResponse(response);
      if (!response.ok) {
        throw new ApiError(
          payload?.mensaje || payload?.message || `La solicitud falló (${response.status}).`,
          {
            status: response.status,
            code: payload?.codigo || payload?.code || null,
            details: payload?.errores || payload?.errors || null,
          },
        );
      }
      return payload;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error?.name === "AbortError") throw new ApiError("La solicitud fue cancelada.", { kind: "cancelled" });
      throw new ApiError("No se pudo conectar con el servidor. Verifica que Laravel esté ejecutándose.", {
        kind: "connection",
        details: error,
      });
    }
  }

  async parseResponse(response) {
    if (response.status === 204) return null;
    if ((response.headers.get("content-type") || "").includes("application/json")) return response.json();
    return response.text();
  }
}

export const apiClient = new ApiClient();
