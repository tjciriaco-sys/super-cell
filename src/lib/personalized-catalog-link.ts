import { createHash, createHmac, randomBytes } from "node:crypto";

/** Token com 256 bits de entropia, somente para emissão em backend confiável. */
export function generatePersonalizedToken(): string {
  return randomBytes(32).toString("base64url");
}
export function hashPersonalizedToken(token: string): string {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    throw new Error("Invalid personalized link token");
  }
  return createHash("sha256").update(token, "utf8").digest("hex");
}
export function buildPersonalizedCatalogUrl(token: string, origin: string): string {
  hashPersonalizedToken(token);
  const base = new URL(origin);
  if (base.protocol !== "https:" && base.hostname !== "localhost") {
    throw new Error("HTTPS required");
  }
  if (base.username || base.password || base.search || base.hash) {
    throw new Error("Invalid catalog origin");
  }
  // A rota /?sc_ref=... está RESERVADA: sem resolução/analytics até homologação.
  const url = new URL("/", base);
  url.searchParams.set("sc_ref", token);
  return url.toString();
}

/**
 * Stable URL for a given CRM lead, with an HMAC key kept ONLY in the backend.
 * Without the secret, the token cannot be derived from a lead identifier.
 * Uses a distinct domain label to avoid HMAC cross-purpose reuse.
 */
export function derivePersonalizedToken(crmLeadId: string, secret: string): string {
  if (!crmLeadId || crmLeadId.length > 128 || !/^[a-zA-Z0-9_-]+$/.test(crmLeadId)) {
    throw new Error("Invalid CRM lead id");
  }
  if (Buffer.byteLength(secret, "utf8") < 32) {
    throw new Error("Invalid secret length");
  }
  return createHmac("sha256", secret)
    .update("supercell:datacrazy:catalog:v1\0" + crmLeadId, "utf8")
    .digest("base64url");
}
