import { createPublicClient } from "@/lib/supabase/public";
import type { Acquirer, CatalogVariant, CommercialSettings, LogisticsException, Schedule } from "@/lib/types";

export async function getCatalog() {
  const { data, error } = await createPublicClient()
    .from("public_catalog")
    .select("*")
    .order("featured", { ascending: false })
    .order("product_name");

  if (error) throw error;
  return (data ?? []) as CatalogVariant[];
}

export async function getProduct(slug: string) {
  const { data, error } = await createPublicClient()
    .from("public_catalog")
    .select("*")
    .eq("slug", slug)
    .order("storage_gb")
    .order("color");

  if (error) throw error;
  return (data ?? []) as CatalogVariant[];
}

export async function getCommerceData() {
  const supabase = createPublicClient();
  const [a, s, e, c] = await Promise.all([
    supabase
      .from("payment_acquirers")
      .select("id,name,code,is_current,settlement_label,max_installments,featured_primary,featured_secondary,installment_plans(installments,factor,active)")
      .eq("is_current", true)
      .single(),
    supabase.from("logistics_schedules").select("*").eq("active", true).order("weekday").order("departure_time"),
    supabase.from("logistics_exceptions").select("*"),
    supabase.from("commercial_settings").select("key,value").eq("public", true),
  ]);

  if (a.error) throw a.error;
  if (s.error) throw s.error;
  if (e.error) throw e.error;
  if (c.error) throw c.error;

  const settings = Object.fromEntries((c.data ?? []).map((item) => [item.key, item.value])) as CommercialSettings;

  return {
    acquirer: a.data as unknown as Acquirer,
    schedules: (s.data ?? []) as Schedule[],
    exceptions: (e.data ?? []) as LogisticsException[],
    settings,
  };
}
