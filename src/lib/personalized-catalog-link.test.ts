import { describe, expect, it } from "vitest";
import { buildPersonalizedCatalogUrl, derivePersonalizedToken, generatePersonalizedToken, hashPersonalizedToken } from "./personalized-catalog-link";

describe("personalized catalog links (isolated)", () => {
  it("creates opaque, distinct 256-bit tokens", () => {
    const a = generatePersonalizedToken();
    const b = generatePersonalizedToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(b).not.toBe(a);
    expect(hashPersonalizedToken(a)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashPersonalizedToken(a)).toBe(hashPersonalizedToken(a));
  });
  it("builds a clean catalog URL without CRM identifiers", () => {
    const token = generatePersonalizedToken();
    const u = new URL(buildPersonalizedCatalogUrl(token, "https://catalogo.supercellrn.com"));
    expect(u.origin).toBe("https://catalogo.supercellrn.com");
    expect(u.pathname).toBe("/");
    expect(u.searchParams.get("sc_ref")).toBe(token);
    expect([...u.searchParams.keys()]).toEqual(["sc_ref"]);
  });
  it("derives a stable opaque token for the same CRM lead", () => {
    const secret = "test-secret-must-be-at-least-32-characters!";
    const a = derivePersonalizedToken("crm-lead-01", secret);
    expect(a).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(derivePersonalizedToken("crm-lead-01", secret)).toBe(a);
    expect(derivePersonalizedToken("crm-lead-02", secret)).not.toBe(a);
    expect(a).not.toContain("crm-lead");
    expect(() => derivePersonalizedToken("crm-lead-01", "short")).toThrow();
  });
  it("rejects invalid tokens and insecure origins", () => {
    expect(() => hashPersonalizedToken("5584999999999")).toThrow();
    expect(() => buildPersonalizedCatalogUrl(generatePersonalizedToken(), "http://example.com")).toThrow();
    expect(() => buildPersonalizedCatalogUrl(generatePersonalizedToken(), "https://user:pass@example.com")).toThrow();
  });
});
