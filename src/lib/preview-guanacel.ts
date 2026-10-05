import type { CatalogVariant } from "@/lib/types";
import { automaticPixPrice } from "@/lib/pricing";

type PreviewUnit = {
  line: number;
  model: string;
  storage: number;
  color: string;
  colorHex: string;
  cost: number;
  battery: number;
  image: string;
};

const publishableUnits: PreviewUnit[] = [
  { line: 1, model: "iPhone 12", storage: 128, color: "Preto", colorHex: "#1F2020", cost: 1480, battery: 92, image: "/products/guanacel-20261003/iphone-12-preto-1-cor.webp" },
  { line: 2, model: "iPhone 12", storage: 128, color: "Preto", colorHex: "#1F2020", cost: 1460, battery: 86, image: "/products/guanacel-20261003/iphone-12-preto-1-cor.webp" },
  { line: 3, model: "iPhone 12 Pro", storage: 128, color: "Dourado", colorHex: "#F4E8CE", cost: 1730, battery: 90, image: "/products/guanacel-20261003/iphone-12-pro-dourado-1-cor.webp" },
  { line: 4, model: "iPhone 12 Pro", storage: 128, color: "Dourado", colorHex: "#F4E8CE", cost: 1730, battery: 91, image: "/products/guanacel-20261003/iphone-12-pro-dourado-1-cor.webp" },
  { line: 5, model: "iPhone 12 Pro", storage: 128, color: "Azul-Pacífico", colorHex: "#2E4755", cost: 1730, battery: 95, image: "/products/guanacel-20261003/iphone-12-pro-azul-pacifico-1-cor.webp" },
  { line: 6, model: "iPhone 12 Pro", storage: 128, color: "Azul-Pacífico", colorHex: "#2E4755", cost: 1730, battery: 91, image: "/products/guanacel-20261003/iphone-12-pro-azul-pacifico-1-cor.webp" },
  { line: 7, model: "iPhone 13", storage: 128, color: "Preto", colorHex: "#1F2120", cost: 1850, battery: 88, image: "/products/guanacel-20261003/iphone-13-preto-1-cor.webp" },
  { line: 8, model: "iPhone 13", storage: 128, color: "Preto", colorHex: "#1F2120", cost: 1850, battery: 87, image: "/products/guanacel-20261003/iphone-13-preto-1-cor.webp" },
  { line: 9, model: "iPhone 13 Pro", storage: 128, color: "Prateado", colorHex: "#E9E7E1", cost: 2380, battery: 92, image: "/products/guanacel-20261003/iphone-13-pro-prateado-1-cor.webp" },
  { line: 10, model: "iPhone 13 Pro", storage: 128, color: "Grafite", colorHex: "#55575A", cost: 2380, battery: 92, image: "/products/guanacel-20261003/iphone-13-pro-grafite-1-cor.webp" },
  { line: 11, model: "iPhone 13 Pro Max", storage: 128, color: "Verde", colorHex: "#435246", cost: 2600, battery: 76, image: "/products/guanacel-20261003/iphone-13-pro-max-verde-1-cor.webp" },
  { line: 12, model: "iPhone 14", storage: 128, color: "Azul", colorHex: "#A7C1D9", cost: 1970, battery: 93, image: "/products/guanacel-20261003/iphone-14-azul-1-cor.webp" },
  { line: 14, model: "iPhone 14 Pro Max", storage: 256, color: "Roxo", colorHex: "#594F63", cost: 3270, battery: 90, image: "/products/guanacel-20261003/iphone-14-pro-max-roxo-1-cor.webp" },
  { line: 15, model: "iPhone 14 Pro Max", storage: 256, color: "Roxo", colorHex: "#594F63", cost: 3270, battery: 92, image: "/products/guanacel-20261003/iphone-14-pro-max-roxo-1-cor.webp" },
];

function slugify(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const previewGuanacelVariants: CatalogVariant[] = publishableUnits.map((unit) => {
  const suffix = String(unit.line).padStart(2, "0");
  const slug = `${slugify(unit.model)}-seminovo-${unit.storage}-f1-20261003-${suffix}`;
  return {
    variant_id: `00000000-0000-4000-8000-${String(unit.line).padStart(12, "0")}`,
    product_id: `10000000-0000-4000-8000-${String(unit.line).padStart(12, "0")}`,
    slug,
    product_name: `${unit.model} · Bateria ${unit.battery}%`,
    model: unit.model,
    brand_name: "Apple",
    brand_slug: "apple",
    category_name: "iPhone",
    category_slug: "iphone",
    pricing_mode: "standard",
    condition: "seminovo",
    condition_grade: null,
    connectivity: "5G",
    ram_gb: null,
    storage_gb: unit.storage,
    color: unit.color,
    color_hex: unit.colorHex,
    sim_configuration: null,
    battery_minimum: null,
    battery_health_minimum: unit.battery,
    original_components: null,
    never_opened: null,
    warranty_months: null,
    condition_details: "Estado de conservação, originalidade dos componentes, histórico de abertura e garantia não informados na lista do fornecedor.",
    description: "Aparelho seminovo com disponibilidade informada pela Guanacel em 03/10/2026. Saúde da bateria informada individualmente; demais detalhes da unidade são confirmados no WhatsApp.",
    highlights: { Armazenamento: `${unit.storage} GB`, Cor: unit.color, Bateria: `${unit.battery}%` },
    specifications: {},
    images: [unit.image],
    video_url: null,
    badges: ["Seminovo"],
    featured: false,
    price_pix: automaticPixPrice(unit.cost),
    supplier_code: "F1",
    available: true,
    commercial_status: "available",
    storefront_image: unit.image,
    updated_at: "2026-10-03T12:00:00.000Z",
  };
});
