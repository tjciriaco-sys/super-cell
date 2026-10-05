import { createPublicClient } from "@/lib/supabase/public";
import type { Acquirer, CatalogVariant, CommercialSettings, LogisticsException, Schedule } from "@/lib/types";

// Temporary visual pilots for selected Android products. F1 iPhones now come
// exclusively from Supabase so admin edits are reflected immediately in Preview.
const previewPilotCovers: Record<string, string> = {
  "iphone-17-pro": "/products/pilots-v2/iphone-17-pro-1-color.webp",
  "poco-f8-pro-5g-nfc": "/products/pilots-v2/poco-f8-pro-2-colors.webp",
  "poco-c85": "/products/pilots-v2/poco-c85-3-colors.webp",
  "redmi-a7-pro": "/products/pilots-v2/redmi-a7-pro-4-colors.webp",
};

const previewPilotColorImages: Record<string, string> = {
  "poco-f8-pro-5g-nfc|azul": "/products/pilots-v2/colors/poco-f8-pro-azul.webp",
  "poco-f8-pro-5g-nfc|prata": "/products/pilots-v2/colors/poco-f8-pro-prata.webp",
  "poco-c85|preto": "/products/pilots-v2/colors/poco-c85-preto.webp",
  "poco-c85|roxo": "/products/pilots-v2/colors/poco-c85-roxo.webp",
  "poco-c85|verde": "/products/pilots-v2/colors/poco-c85-verde.webp",
  "redmi-a7-pro|preto": "/products/pilots-v2/colors/redmi-a7-pro-preto.webp",
  "redmi-a7-pro|azul-nevoa": "/products/pilots-v2/colors/redmi-a7-pro-azul-nevoa.webp",
  "redmi-a7-pro|verde-palma": "/products/pilots-v2/colors/redmi-a7-pro-verde-palma.webp",
  "redmi-a7-pro|laranja-por-do-sol": "/products/pilots-v2/colors/redmi-a7-pro-laranja-por-do-sol.webp",
};

function normalizeColor(value?: string | null) {
  return (value ?? "").toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function withPreviewPilotCover(variant: CatalogVariant): CatalogVariant {
  if (process.env.VERCEL_ENV === "production") return variant;
  const storefrontImage = previewPilotCovers[variant.slug];
  const colorImage = previewPilotColorImages[`${variant.slug}|${normalizeColor(variant.color)}`];
  return storefrontImage || colorImage ? { ...variant, storefront_image: storefrontImage ?? variant.storefront_image, images: colorImage ? [colorImage] : variant.images } : variant;
}

function isLegacyF1Iphone(variant: CatalogVariant) {
  return process.env.VERCEL_ENV !== "production"
    && variant.supplier_code === "F1"
    && variant.brand_slug === "apple"
    && !variant.slug.includes("-f1-20261003-");
}

export async function getCatalog() {
  const { data, error } = await createPublicClient().from("public_catalog").select("*").order("featured", { ascending: false }).order("product_name");
  if (error) throw error;
  return ((data ?? []) as CatalogVariant[]).map(withPreviewPilotCover).filter((variant) => !isLegacyF1Iphone(variant));
}

export async function getProduct(slug: string) {
  const { data, error } = await createPublicClient().from("public_catalog").select("*").eq("slug", slug).order("storage_gb").order("color");
  if (error) throw error;
  return ((data ?? []) as CatalogVariant[]).map(withPreviewPilotCover).filter((variant) => !isLegacyF1Iphone(variant));
}

export async function getCommerceData() {
  const supabase = createPublicClient();
  const [a, s, e, c] = await Promise.all([
    supabase.from("payment_acquirers").select("id,name,code,is_current,settlement_label,max_installments,featured_primary,featured_secondary,installment_plans(installments,factor,active)").eq("is_current", true).single(),
    supabase.from("logistics_schedules").select("*").eq("active", true).order("weekday").order("departure_time"),
    supabase.from("logistics_exceptions").select("*"),
    supabase.from("commercial_settings").select("key,value").eq("public", true),
  ]);
  if (a.error) throw a.error; if (s.error) throw s.error; if (e.error) throw e.error; if (c.error) throw c.error;
  const settings = Object.fromEntries((c.data ?? []).map((item) => [item.key, item.value])) as CommercialSettings;
  return { acquirer: a.data as unknown as Acquirer, schedules: (s.data ?? []) as Schedule[], exceptions: (e.data ?? []) as LogisticsException[], settings };
}
