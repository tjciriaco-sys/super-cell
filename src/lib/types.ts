export type CatalogVariant = {
  variant_id: string; product_id: string; slug: string; product_name: string; model: string;
  brand_name: string; brand_slug: string; category_name: string; category_slug: string; pricing_mode: "standard" | "accessory";
  condition: "novo" | "seminovo"; condition_grade: "bom" | "muito_bom" | "excelente" | null; connectivity: string | null; ram_gb: number | null;
  storage_gb: number | null; color: string | null; color_hex: string | null; sim_configuration: string | null;
  battery_minimum: number | null; battery_health_minimum: number | null;
  original_components: boolean | null; never_opened: boolean | null; warranty_months: number | null; condition_details: string | null;
  description: string | null; highlights: Record<string, string>;
  specifications: Record<string, Record<string, string>>; images: string[]; video_url: string | null;
  badges: string[]; featured: boolean; price_pix: number | null; supplier_code: string | null; available: boolean;
  commercial_status: "available" | "coming_soon" | "restocking"; storefront_image: string | null; updated_at: string;
};

export type InstallmentPlan = { installments: number; factor: number; active: boolean };
export type Acquirer = { id: string; name: string; code: string; is_current: boolean; settlement_label: string | null; max_installments: number; featured_primary: number; featured_secondary: number | null; installment_plans: InstallmentPlan[] };
export type Schedule = { id: string; weekday: number; departure_time: string; cutoff_minutes: number; active: boolean };
export type LogisticsException = { exception_date: string; no_routes: boolean; custom_routes: Array<{ time: string; cutoff_minutes?: number }>; note: string | null };
export type CommercialSettings = Record<string, unknown>;
