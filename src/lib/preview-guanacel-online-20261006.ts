import type { CatalogVariant } from "@/lib/types";
import { automaticPixPrice } from "@/lib/pricing";

type GuanacelPreviewRecord = {
  externalCode: string;
  slug: string;
  productName: string;
  model: string;
  brandName: string;
  brandSlug: string;
  categoryName: string;
  categorySlug: string;
  connectivity: string | null;
  ram: number | null;
  storage: number | null;
  color: string | null;
  colorHex: string | null;
  cost: number;
  image: string;
  extraHighlights?: Record<string, string>;
  description?: string;
};

const coverBySlug: Record<string, string> = {
  "poco-c71": "/products/guanacel-20261006/cover-poco-c71.webp",
  "poco-f8-pro-5g-nfc": "/products/guanacel-20261006/cover-poco-f8-pro-5g-nfc.webp",
  "redmi-note-15-4g": "/products/guanacel-20261006/cover-redmi-note-15-4g.webp",
  "redmi-pad-2": "/products/guanacel-20261006/redmi-pad-2-4-128-cinza.webp",
};

const records: GuanacelPreviewRecord[] = [
  { externalCode: "000015", slug: "multilaser-up-play-3g", productName: "Multilaser UP Play 3G", model: "UP Play 3G", brandName: "Multilaser", brandSlug: "multilaser", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "3G", ram: null, storage: null, color: null, colorHex: null, cost: 120, image: "/products/guanacel-20261006/multilaser-up-play-3g.webp" },
  { externalCode: "000060", slug: "xiaomi-pad-7", productName: "Xiaomi Pad 7", model: "Pad 7", brandName: "Xiaomi", brandSlug: "xiaomi", categoryName: "Tablets", categorySlug: "tablets", connectivity: null, ram: 8, storage: 256, color: "Cinza", colorHex: "#777A7D", cost: 1990, image: "/products/guanacel-20261006/xiaomi-pad-7-8-256-cinza.webp" },
  { externalCode: "000003", slug: "iphone-17-pro", productName: "iPhone 17 Pro", model: "iPhone 17 Pro", brandName: "Apple", brandSlug: "apple", categoryName: "iPhone", categorySlug: "iphone", connectivity: "5G", ram: null, storage: 256, color: "Laranja", colorHex: "#D96F32", cost: 6950, image: "/products/guanacel-20261006/iphone-17-pro-256.webp" },
  { externalCode: "1000100", slug: "iphone-17-pro-max", productName: "iPhone 17 Pro Max", model: "iPhone 17 Pro Max", brandName: "Apple", brandSlug: "apple", categoryName: "iPhone", categorySlug: "iphone", connectivity: "5G", ram: null, storage: 256, color: "Azul", colorHex: "#477FB2", cost: 7450, image: "/products/guanacel-20261006/iphone-17-pro-max-256-azul.webp" },
  { externalCode: "1000037", slug: "poco-c71", productName: "POCO C71", model: "C71", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "4G", ram: 3, storage: 64, color: "Preto", colorHex: "#242424", cost: 680, image: "/products/guanacel-20261006/poco-c71-3-64-preto.webp" },
  { externalCode: "000137", slug: "poco-c71", productName: "POCO C71", model: "C71", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "4G", ram: 3, storage: 64, color: "Azul", colorHex: "#A7C1D9", cost: 680, image: "/products/guanacel-20261006/poco-c71-3-64-azul.webp" },
  { externalCode: "1000038", slug: "poco-c71", productName: "POCO C71", model: "C71", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "4G", ram: 4, storage: 128, color: "Preto", colorHex: "#242424", cost: 790, image: "/products/guanacel-20261006/poco-c71-4-128-preto.webp" },
  { externalCode: "1000050", slug: "poco-f8-pro-5g-nfc", productName: "POCO F8 Pro 5G NFC", model: "F8 Pro", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "5G", ram: 12, storage: 512, color: "Azul", colorHex: "#477FB2", cost: 3400, image: "/products/guanacel-20261006/poco-f8-pro-12-512-azul.webp", extraHighlights: { NFC: "Sim" } },
  { externalCode: "000025", slug: "poco-f8-pro-5g-nfc", productName: "POCO F8 Pro 5G NFC", model: "F8 Pro", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "5G", ram: 12, storage: 512, color: "Prata", colorHex: "#C8CBD0", cost: 3600, image: "/products/guanacel-20261006/poco-f8-pro-12-512-prata.webp", extraHighlights: { NFC: "Sim" } },
  { externalCode: "1000056", slug: "poco-f8-pro-5g-nfc", productName: "POCO F8 Pro 5G NFC", model: "F8 Pro", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "5G", ram: 12, storage: 512, color: "Preto", colorHex: "#242424", cost: 3400, image: "/products/guanacel-20261006/poco-f8-pro-12-512-preto.webp", extraHighlights: { NFC: "Sim" } },
  { externalCode: "1000059", slug: "poco-m7-pro-5g", productName: "POCO M7 Pro 5G", model: "M7 Pro", brandName: "POCO", brandSlug: "poco", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "5G", ram: 6, storage: 128, color: "Preto", colorHex: "#242424", cost: 980, image: "/products/guanacel-20261006/poco-m7-pro-5g-6-128-preto.webp" },
  { externalCode: "000052", slug: "receptor-alphaplay-plus", productName: "Receptor Alphaplay Plus", model: "ALPHAPLAY PLUS", brandName: "Alphaplay", brandSlug: "alphaplay", categoryName: "Receptores", categorySlug: "receptores", connectivity: null, ram: null, storage: null, color: null, colorHex: null, cost: 450, image: "/products/guanacel-20261006/receptor-alphaplay-plus.webp" },
  { externalCode: "1000036", slug: "redmi-15c", productName: "REDMI 15C", model: "15C", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: null, ram: 16, storage: 256, color: "Preto", colorHex: "#242424", cost: 1000, image: "/products/guanacel-20261006/redmi-15c-16-256-preto-global.webp", extraHighlights: { Versão: "Global" } },
  { externalCode: "000141", slug: "redmi-17", productName: "REDMI 17", model: "17", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: null, ram: 8, storage: 128, color: "Preto", colorHex: "#242424", cost: 1000, image: "/products/guanacel-20261006/redmi-17-8-128-preto.webp" },
  { externalCode: "1000048", slug: "redmi-a5", productName: "REDMI A5", model: "A5", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: null, ram: 4, storage: 128, color: "Preto", colorHex: "#242424", cost: 810, image: "/products/guanacel-20261006/redmi-a5-4-128-preto.webp" },
  { externalCode: "1000051", slug: "redmi-a7-pro", productName: "REDMI A7 Pro", model: "A7 Pro", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: null, ram: null, storage: 64, color: "Preto", colorHex: "#242424", cost: 720, image: "/products/guanacel-20261006/redmi-a7-pro-64-preto.webp" },
  { externalCode: "1000057", slug: "redmi-note-15-4g", productName: "REDMI Note 15 4G", model: "Note 15", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "4G", ram: 8, storage: 256, color: "Azul", colorHex: "#477FB2", cost: 1280, image: "/products/guanacel-20261006/redmi-note-15-4g-8-256-azul.webp" },
  { externalCode: "000119", slug: "redmi-note-15-4g", productName: "REDMI Note 15 4G", model: "Note 15", brandName: "Redmi", brandSlug: "redmi", categoryName: "Smartphones", categorySlug: "smartphones", connectivity: "4G", ram: 8, storage: 256, color: "Preto", colorHex: "#242424", cost: 1280, image: "/products/guanacel-20261006/redmi-note-15-4g-8-256-preto.webp", extraHighlights: { NFC: "Identificado na opção preta pelo fornecedor" } },
  { externalCode: ";000007", slug: "redmi-pad-2", productName: "REDMI Pad 2", model: "Pad 2", brandName: "Redmi", brandSlug: "redmi", categoryName: "Tablets", categorySlug: "tablets", connectivity: null, ram: 4, storage: 128, color: "Cinza", colorHex: "#777A7D", cost: 1130, image: "/products/guanacel-20261006/redmi-pad-2-4-128-cinza.webp" },
  { externalCode: "000132", slug: "redmi-pad-2", productName: "REDMI Pad 2", model: "Pad 2", brandName: "Redmi", brandSlug: "redmi", categoryName: "Tablets", categorySlug: "tablets", connectivity: null, ram: 4, storage: 256, color: "Cinza", colorHex: "#777A7D", cost: 1250, image: "/products/guanacel-20261006/redmi-pad-2-4-256-cinza.webp" },
];

const currentSlugs = new Set(records.map((record) => record.slug));
const retiredOnlineF1Slugs = new Set([
  "redmi-pad-2-pro",
  "smartwatch-kw20-ultra-2-5-pulseiras",
  "smartwatch-w10-serie-10-46mm",
  "smartwatch-ws10-2-ultra-7-pulseiras",
  "xiaomi-14t-nfc",
]);

function highlights(record: GuanacelPreviewRecord) {
  const entries: Array<[string, string]> = [];
  if (record.ram) entries.push(["RAM", `${record.ram} GB`]);
  if (record.storage) entries.push(["Armazenamento", `${record.storage} GB`]);
  if (record.color) entries.push(["Cor", record.color]);
  if (record.connectivity) entries.push(["Rede", record.connectivity]);
  entries.push(...Object.entries(record.extraHighlights ?? {}));
  return Object.fromEntries(entries);
}

export const previewGuanacelOnlineVariants: CatalogVariant[] = records.map((record, index) => ({
  variant_id: `preview-f1a-20261006-${record.externalCode.replace(/[^a-z0-9]/gi, "") || index}`,
  product_id: `preview-f1a-product-${record.slug}`,
  slug: record.slug,
  product_name: record.productName,
  model: record.model,
  brand_name: record.brandName,
  brand_slug: record.brandSlug,
  category_name: record.categoryName,
  category_slug: record.categorySlug,
  pricing_mode: "standard",
  condition: "novo",
  condition_grade: null,
  connectivity: record.connectivity,
  ram_gb: record.ram,
  storage_gb: record.storage,
  color: record.color,
  color_hex: record.colorHex,
  sim_configuration: null,
  battery_minimum: null,
  battery_health_minimum: null,
  original_components: null,
  never_opened: null,
  warranty_months: null,
  condition_details: null,
  description: record.description ?? "Produto novo e lacrado com disponibilidade confirmada no catálogo online da Guanacel em 06/10/2026. A disponibilidade é confirmada novamente no fechamento do pedido.",
  highlights: highlights(record),
  specifications: {},
  images: [record.image],
  video_url: null,
  badges: [],
  featured: false,
  price_pix: automaticPixPrice(record.cost),
  supplier_code: "F1",
  available: true,
  commercial_status: "available",
  storefront_image: coverBySlug[record.slug] ?? record.image,
  updated_at: "2026-10-06T15:00:00.000Z",
}));

export function mergePreviewGuanacelCatalog(base: CatalogVariant[]) {
  if (process.env.VERCEL_ENV === "production") return base;

  const prepared = base
    .filter((variant) => !currentSlugs.has(variant.slug))
    .map((variant) =>
      retiredOnlineF1Slugs.has(variant.slug) && variant.supplier_code === "F1"
        ? { ...variant, price_pix: null, supplier_code: null, available: false, commercial_status: "restocking" as const }
        : variant,
    );

  return [...prepared, ...previewGuanacelOnlineVariants];
}

export function mergePreviewGuanacelProduct(slug: string, base: CatalogVariant[]) {
  if (process.env.VERCEL_ENV === "production") return base;
  if (currentSlugs.has(slug)) return previewGuanacelOnlineVariants.filter((variant) => variant.slug === slug);

  if (retiredOnlineF1Slugs.has(slug)) {
    return base.map((variant) =>
      variant.supplier_code === "F1"
        ? { ...variant, price_pix: null, supplier_code: null, available: false, commercial_status: "restocking" as const }
        : variant,
    );
  }

  return base;
}
