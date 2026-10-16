import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  rows: new Map<string, { token_hash: string; revoked_at: string | null }>(),
  calls: { insert: 0 },
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_key: string, _value: string) => ({
          eq: (_k2: string, value: string) => ({
            maybeSingle: async () => ({ data: state.rows.get(value) ?? null, error: null }),
          }),
        }),
      }),
      insert: async ({ crm_lead_id, token_hash }: { crm_lead_id: string; token_hash: string }) => {
        state.calls.insert++;
        if (state.rows.has(crm_lead_id)) return { error: { code: "23505" } };
        state.rows.set(crm_lead_id, { token_hash, revoked_at: null });
        return { error: null };
      },
    }),
  }),
}));
import { provisionCatalogLink } from "./personalized-catalog-provision";

describe("personalized link provisioning", () => {
  beforeEach(() => {
    state.rows.clear();
    state.calls.insert = 0;
    process.env.SC_LINK_HMAC_SECRET = "local-test-hmac-key-with-at-least-thirty-two-characters";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "unit-test-only";
    process.env.SC_CATALOG_PUBLIC_ORIGIN = "https://catalogo.supercellrn.com";
  });
  it("reuses the same link without another insert", async () => {
    const first = await provisionCatalogLink("lead_001");
    const second = await provisionCatalogLink("lead_001");
    expect(first).toBe(second);
    expect(state.calls.insert).toBe(1);
    expect(new URL(first).searchParams.get("sc_ref")).toHaveLength(43);
  });
  it("isolates different leads", async () => {
    expect(await provisionCatalogLink("lead_001")).not.toBe(await provisionCatalogLink("lead_002"));
  });
  it("fails closed if a token is revoked", async () => {
    await provisionCatalogLink("lead_001");
    state.rows.get("lead_001")!.revoked_at = new Date().toISOString();
    await expect(provisionCatalogLink("lead_001")).rejects.toThrow(/revoked/);
  });
  it("fails closed after key rotation rather than overwriting a link", async () => {
    await provisionCatalogLink("lead_001");
    process.env.SC_LINK_HMAC_SECRET = "different-long-test-hmac-key-at-least-thirty-two-characters";
    await expect(provisionCatalogLink("lead_001")).rejects.toThrow(/secret rotation/);
  });
  it("does not provision without server credentials", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    await expect(provisionCatalogLink("lead_001")).rejects.toThrow(/not configured/);
  });
});
