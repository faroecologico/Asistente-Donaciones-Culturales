
import type { AiRequestPayload, AiResponsePayload } from "../types";
// Import store to get the apiKey directly in the service logic (client side)
import { useAppStore } from "../store";

const DEFAULT_API_URL = "http://localhost:3000/api/ai/generate";
const DEFAULT_TIMEOUT_MS = 30_000;

export class AiServiceError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, opts?: { status?: number; details?: unknown }) {
    super(message);
    this.name = "AiServiceError";
    this.status = opts?.status;
    this.details = opts?.details;
  }
}

type GenerateContentOptions = {
  apiUrl?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
};

async function safeReadJson(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await response.text().catch(() => "");
    return { message: "Respuesta no JSON del servidor", raw: text };
  }

  return response.json().catch(async () => {
    const text = await response.text().catch(() => "");
    return { message: "JSON inválido en respuesta", raw: text };
  });
}

export const generateContent = async (
  payload: AiRequestPayload,
  options: GenerateContentOptions = {}
): Promise<AiResponsePayload> => {
  const apiUrl = options.apiUrl ?? DEFAULT_API_URL;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  // Retrieve user provided API Key from store
  const userApiKey = useAppStore.getState().apiKey;

  if (!userApiKey) {
      throw new AiServiceError("Falta la API Key de Gemini. Configúrala en el menú.");
  }

  // AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortListener = () => controller.abort();
  if (options.signal) {
    if (options.signal.aborted) controller.abort();
    else options.signal.addEventListener("abort", abortListener, { once: true });
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Send key in a custom header so the backend proxy can use it
        "x-gemini-api-key": userApiKey
      },
      cache: "no-store",
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    const data = await safeReadJson(response);

    if (!response.ok) {
      const details =
        typeof data === "object" && data !== null ? data : { raw: data };

      const msg =
        (details as any)?.error?.message ||
        (details as any)?.message ||
        `AI Service Error: ${response.status} ${response.statusText}`;

      throw new AiServiceError(msg, { status: response.status, details });
    }

    return data as AiResponsePayload;
  } catch (err: any) {
    if (err?.name === "AbortError") {
      throw new AiServiceError(
        `Timeout: el servicio de IA tardó más de ${Math.round(timeoutMs / 1000)}s`,
        { details: { timeoutMs } }
      );
    }

    if (err instanceof AiServiceError) throw err;

    throw new AiServiceError("No se pudo conectar con el servicio de IA.", {
      details: { originalError: String(err?.message || err) },
    });
  } finally {
    clearTimeout(timeoutId);
    if (options.signal) {
      options.signal.removeEventListener("abort", abortListener);
    }
  }
};
