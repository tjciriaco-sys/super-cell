import { createClient } from "@supabase/supabase-js";
import {
  buildPersonalizedCatalogUrl,
  derivePersonalizedToken,
  hashPersonalizedToken,
} from "./personalized-catalog-link";

/**
 * Backend-only provisioner. Not exposed as an HTTP route until authenticated
 * DataCrazy integration is configured and the migration is homologated.
 */
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

  // Idempotent per lead, including concurrent requests. Never expose this
  // backend key or the CRM lead ID in browser code.
  const { data, error } = await db
    .from("sc_personalized_links")
    .upsert(
      { crm_provider: "datacrazy", crm_lead_id: crmLeadId, token_hash: tokenHash },
      { onConflict: "crm_provider,crm_lead_id" },
    )
    .select("token_hash,revoked_at")
    .single();
  if (error || !data || data.token_hash !== tokenHash || data.revoked_at) {
    throw new Error("Unable to provision personalized catalog link");
  }
  return buildPersonalizedCatalogUrl(token, site);
}
