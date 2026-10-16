import "server-only";
import { createClient } from "@supabase/supabase-js";
import { buildPersonalizedCatalogUrl, derivePersonalizedToken, hashPersonalizedToken } from "./personalized-catalog-link";

/** Server-side only. No public route or CRM write until homologation. */
export async function provisionCatalogLink(crmLeadId: string): Promise<string> {
  const secret = process.env.SC_LINK_HMAC_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const site = process.env.SC_CATALOG_PUBLIC_ORIGIN || "https://catalogo.supercellrn.com";
  if (!secret || !supabaseUrl || !serviceKey) {
    throw new Error("Personalized link backend is not configured");
  }
  const token = derivePersonalizedToken(crmLeadId, secret);
  const tokenHash = hashPersonalizedToken(token);
  const db = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Never UPSERT existing records: that could accidentally undo revocation or
  // reassign a link after changing the HMAC key. Unique constraint protects
  // against parallel requests for the same lead.
  const lookup = () => db.from("sc_personalized_links")
    .select("token_hash,revoked_at")
    .eq("crm_provider", "datacrazy")
    .eq("crm_lead_id", crmLeadId)
    .maybeSingle();
  let { data, error } = await lookup();
  if (error) throw new Error("Cannot read personalized link");
  if (!data) {
    const inserted = await db.from("sc_personalized_links")
      .insert({ crm_provider: "datacrazy", crm_lead_id: crmLeadId, token_hash: tokenHash });
    if (inserted.error && inserted.error.code !== "23505") {
      throw new Error("Cannot create personalized link");
    }
    ({ data, error } = await lookup());
    if (error || !data) throw new Error("Cannot resolve personalized link");
  }
  if (data.revoked_at || data.token_hash !== tokenHash) {
    throw new Error("Link revoked or secret rotation requires migration");
  }
  return buildPersonalizedCatalogUrl(token, site);
}
