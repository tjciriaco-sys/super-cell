import { createHash, randomBytes } from "node:crypto";

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
