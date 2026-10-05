"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banknote, ChevronDown, ChevronRight, ListFilter, Search, SlidersHorizontal, X } from "lucide-react";
import type { CatalogVariant } from "@/lib/types";
import { money, productDisplayName } from "@/lib/utils";
import { ProductImage } from "@/components/product-image";

type ProductGroup = {
  key: string; variantId: string; slug: string; name: string; brand: string; category: string;
  condition: string; conditionGrade: CatalogVariant["condition_grade"]; connectivity: string | null;
  pricingMode: CatalogVariant["pricing_mode"]; price: number | null; supplierCode: string | null; image?: string; badges: string[]; variant: string; colors: string[]; commercialStatus: CatalogVariant["commercial_status"]; batteryHealth: number | null;
};
type SortMode = "featured" | "price_asc" | "price_desc" | "name";
const gradeLabels = { bom: "Bom", muito_bom: "Muito bom", excelente: "Excelente" } as const;
const primaryCategories = [
  { slug: "androids", label: "Androids" }, { slug: "iphones", label: "iPhones" },
  { slug: "tablets", label: "Tablets" }, { slug: "smartwatches", label: "Smartwatches" },
];

function matchesCategory(variant: CatalogVariant, category: string) {
  if (category === "todos") return true;
  if (category === "iphones") return variant.brand_slug === "apple" || /iphone/i.test(variant.category_slug);
  if (category === "androids") return variant.brand_slug !== "apple" && /smartphone/i.test(variant.category_slug);
  if (category === "tablets") return /tablet/i.test(variant.category_slug);
  if (category === "smartwatches") return /smartwatch|relogio|relógio/i.test(`${variant.category_slug} ${variant.category_name}`);
  return variant.category_slug === category;
}
function inPriceRange(price: number | null, range: string) {
  if (range !== "todos" && price === null) return false;
  const value = price ?? 0;
  if (range === "ate-1000") return value <= 1000;
  if (range === "1000-2000") return value > 1000 && value <= 2000;
  if (range === "2000-3000") return value > 2000 && value <= 3000;
  if (range === "acima-3000") return value > 3000;
  return true;
}
function catalogProductName(variant: CatalogVariant) {
  return productDisplayName(variant).replace(/\s*[·-]?\s*🔋\s*\d+%/u, "").trim();
}

export function CatalogGrid({ variants, primaryInstallments, primaryFactor, accessoryDeliveryFee, accessoryFreeThreshold }: { variants: CatalogVariant[]; primaryInstallments: number; primaryFactor: number; accessoryDeliveryFee: number; accessoryFreeThreshold: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("price_desc");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState("todos");
  const [condition, setCondition] = useState("todos");
  const [storage, setStorage] = useState("todos");
  const [connectivity, setConnectivity] = useState("todos");
  const [otherOpen, setOtherOpen] = useState(false);

  const availablePrimary = useMemo(() => primaryCategories.filter((item) => variants.some((variant) => matchesCategory(variant, item.slug))), [variants]);
  const otherCategories = useMemo(() => {
    const primarySlugs = new Set(["iphone", "smartphones", "tablets", "smartwatches"]);
    return Array.from(new Map(variants.filter((variant) => !primarySlugs.has(variant.category_slug)).map((variant) => [variant.category_slug, { slug: variant.category_slug, label: variant.category_name }])).values());
  }, [variants]);
  const defaultCategory = variants.some((variant) => matchesCategory(variant, "androids")) ? "androids" : "todos";
  const requestedCategory = searchParams.get("categoria") ?? defaultCategory;
  const category = requestedCategory === "todos" || variants.some((variant) => matchesCategory(variant, requestedCategory)) ? requestedCategory : defaultCategory;
  const storageOptions = useMemo(() => Array.from(new Set(variants.map((variant) => variant.storage_gb).filter((value): value is number => Boolean(value)))).sort((a, b) => a - b), [variants]);
  const activeFilterCount = [priceRange, condition, storage, connectivity].filter((value) => value !== "todos").length;
  const normalizedQuery = query.toLocaleLowerCase("pt-BR").trim();

  const filteredVariants = useMemo(() => variants.filter((variant) => {
    const text = `${variant.product_name} ${variant.model} ${variant.brand_name} ${variant.category_name} ${variant.ram_gb ?? ""} ${variant.storage_gb ?? ""} ${variant.color ?? ""} ${variant.connectivity ?? ""} ${variant.condition_grade ? gradeLabels[variant.condition_grade] : ""}`.toLocaleLowerCase("pt-BR");
    return matchesCategory(variant, category) && (!normalizedQuery || text.includes(normalizedQuery))
      && inPriceRange(variant.price_pix === null ? null : Number(variant.price_pix), priceRange) && (condition === "todos" || variant.condition === condition)
      && (storage === "todos" || String(variant.storage_gb) === storage) && (connectivity === "todos" || variant.connectivity === connectivity);
  }), [variants, category, normalizedQuery, priceRange, condition, storage, connectivity]);

  const products = useMemo(() => {
    const map = new Map<string, ProductGroup>();
    for (const variant of filteredVariants) {
      const key = `${variant.slug}:${variant.condition_grade ?? variant.condition}`;
      const current = map.get(key);
      const colors = Array.from(new Set([...(current?.colors ?? []), ...(variant.color ? [variant.color] : [])]));
      const next: ProductGroup = { key, variantId: variant.variant_id, slug: variant.slug, name: catalogProductName(variant), brand: variant.brand_name, category: variant.category_slug, condition: variant.condition, conditionGrade: variant.condition_grade, connectivity: variant.connectivity, pricingMode: variant.pricing_mode, price: variant.price_pix === null ? null : Number(variant.price_pix), supplierCode: variant.supplier_code, image: variant.storefront_image ?? variant.images?.[0], badges: variant.badges, variant: [variant.ram_gb ? `${variant.ram_gb} GB` : null, variant.storage_gb ? `${variant.storage_gb} GB` : null].filter(Boolean).join(" + "), colors, commercialStatus: variant.commercial_status, batteryHealth: variant.condition === "seminovo" ? variant.battery_health_minimum : null };
      if (!current || (next.price !== null && (current.price === null || next.price < current.price))) map.set(key, next); else current.colors = colors;
    }
    return [...map.values()].sort((a, b) => {
      if (sort === "price_asc") return (a.price ?? Number.MAX_SAFE_INTEGER) - (b.price ?? Number.MAX_SAFE_INTEGER);
      if (sort === "price_desc") return (b.price ?? -1) - (a.price ?? -1);
      if (sort === "name") return a.name.localeCompare(b.name, "pt-BR");
      return Number(b.badges.includes("Mais vendido")) - Number(a.badges.includes("Mais vendido"));
    });
  }, [filteredVariants, sort]);

  const clearFilters = () => { setPriceRange("todos"); setCondition("todos"); setStorage("todos"); setConnectivity("todos"); };
  const selectCategory = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("categoria", value);
    router.replace(params.size ? `${pathname}?${params.toString()}` : pathname, { scroll: false });
    setOtherOpen(false);
  };

  return <section id="catalogo" className="catalog-section shell">
    <div className="section-heading"><div><span className="eyebrow">📱 Escolha com segurança</span><h2>Encontre seu próximo aparelho</h2></div><span className="result-count">{filteredVariants.length} {filteredVariants.length === 1 ? "opção disponível" : "opções disponíveis"}</span></div>
    <div className="catalog-tools"><label className="search-field"><Search size={20}/><span className="sr-only">Buscar produtos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?"/></label><div className="category-scroll" role="group" aria-label="Categorias"><SlidersHorizontal size={18}/>{availablePrimary.map((item) => <button key={item.slug} className={category === item.slug ? "active" : ""} onClick={() => selectCategory(item.slug)}>{item.label}</button>)}{otherCategories.length > 0 && <button className={otherCategories.some((item) => item.slug === category) ? "active" : ""} onClick={() => setOtherOpen((open) => !open)} aria-expanded={otherOpen}>Outras <ChevronDown/></button>}<button className={category === "todos" ? "active" : ""} onClick={() => selectCategory("todos")}>Todos</button></div></div>
    {otherOpen && <div className="other-categories" aria-label="Outras categorias">{otherCategories.map((item) => <button key={item.slug} onClick={() => selectCategory(item.slug)}>{item.label}</button>)}</div>}
    <div className="catalog-controls"><label><span>Ordenar</span><select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}><option value="featured">Destaques</option><option value="price_asc">Menor preço → maior preço</option><option value="price_desc">Maior preço → menor preço</option><option value="name">Nome A–Z</option></select></label><button className={filtersOpen ? "active" : ""} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><ListFilter/> Filtros{activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button></div>
    {filtersOpen && <div className="filter-panel"><div className="filter-panel-head"><strong>Filtrar produtos</strong>{activeFilterCount > 0 && <button onClick={clearFilters}><X/> Limpar</button>}</div><div className="filter-fields"><label>Faixa de preço<select value={priceRange} onChange={(event) => setPriceRange(event.target.value)}><option value="todos">Todos os preços</option><option value="ate-1000">Até R$ 1.000</option><option value="1000-2000">R$ 1.000 a R$ 2.000</option><option value="2000-3000">R$ 2.000 a R$ 3.000</option><option value="acima-3000">Acima de R$ 3.000</option></select></label><label>Condição<select value={condition} onChange={(event) => setCondition(event.target.value)}><option value="todos">Todas</option><option value="novo">Novo · Lacrado</option><option value="seminovo">Seminovo</option></select></label><label>Armazenamento<select value={storage} onChange={(event) => setStorage(event.target.value)}><option value="todos">Todos</option>{storageOptions.map((value) => <option key={value} value={value}>{value} GB</option>)}</select></label><label>Conectividade<select value={connectivity} onChange={(event) => setConnectivity(event.target.value)}><option value="todos">Todas</option><option value="4G">4G</option><option value="5G">5G</option></select></label></div></div>}
    {products.length ? <div className="product-grid">{products.map((product, index) => {
      const isAvailable=product.commercialStatus==="available"&&product.price!==null;
      const paidDelivery = isAvailable && product.pricingMode === "accessory" && product.price! < accessoryFreeThreshold;
      const displayBase = (product.price??0) + (paidDelivery ? accessoryDeliveryFee : 0);
      const total = displayBase * primaryFactor;
      const badge = product.badges.find((item) => ![product.condition, "novo", "lacrado", "seminovo"].includes(item.toLowerCase()));
      const acceptsTradeIn = /iphone|smartphone/i.test(product.category) || product.brand.toLowerCase()==="apple";
      const detailChipStyle = {background:"linear-gradient(135deg,rgba(255,252,243,.96),rgba(247,238,214,.9))",color:"#6b5526",border:"1px solid #e6d8b6",borderRadius:999,padding:"4px 10px",fontSize:10,fontWeight:850,boxShadow:"inset 0 1px 0 rgba(255,255,255,.8)"} as const;
      return <article className="product-card" key={product.key}><Link href={`/produto/${product.slug}?variante=${product.variantId}`} aria-label={`Ver ${product.name}${product.conditionGrade ? ` em estado ${gradeLabels[product.conditionGrade]}` : ""}`}><ProductImage src={product.image} alt={product.name} priority={index < 2}/><div className="card-body" style={{display:"flex",flexDirection:"column"}}><div className="badges" style={{height:"auto",minHeight:20,overflow:"visible",marginBottom:8}}>{product.brand.toLowerCase()==="apple"&&<span>Apple</span>}{product.condition === "novo" && <span>✨ Novo · Lacrado</span>}{product.condition === "seminovo" && <span>Seminovo</span>}{product.conditionGrade && <span>✨ {gradeLabels[product.conditionGrade]}</span>}{badge && <span>{badge}</span>}</div><div style={{display:"grid",gap:0}}><h3 style={{minHeight:0,margin:0}}>{product.name}</h3><p className="color-count" style={{minHeight:0,margin:"3px 0 6px"}}>{product.colors.length > 1 ? `🎨 ${product.colors.length} cores disponíveis` : product.colors.length === 1 ? `🎨 Cor: ${product.colors[0]}` : ""}</p>{(product.variant || product.batteryHealth !== null) && <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",margin:0}}>{product.variant && <span style={detailChipStyle}>{product.variant}</span>}{product.batteryHealth !== null && <span style={detailChipStyle}>🔋 {product.batteryHealth}%</span>}</div>}</div>{isAvailable?<><div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"15px 0 12px"}}><div className="price-block" style={{justifyContent:"center",margin:0}}><strong>{money.format(product.price!)}</strong><span>💸 no Pix</span>{product.supplierCode&&<sup className="supplier-code">{product.supplierCode}</sup>}</div><p className="installment-line" style={{margin:"3px 0 0",textAlign:"center",minHeight:0}}>💳 ou {primaryInstallments}x de <strong>{money.format(total / primaryInstallments)}</strong></p></div>{product.pricingMode === "accessory"&&<p className={`card-delivery-note ${paidDelivery?"paid":"free"}`}>{paidDelivery?`🚚 + ${money.format(accessoryDeliveryFee)} de entrega`:`🚚 Entrega grátis`}</p>}{acceptsTradeIn&&<div style={{display:"grid",gridTemplateColumns:"34px minmax(0,1fr)",alignItems:"center",gap:9,margin:"0 0 12px",padding:"9px 10px",border:"1px solid #ead8ad",borderRadius:11,background:"linear-gradient(135deg,#fffdf7,#fff7df)",color:"#6b4c0d",fontSize:10,fontWeight:800,lineHeight:1.28}}><span aria-hidden="true" style={{width:34,height:34,display:"grid",placeItems:"center",borderRadius:10,background:"#f6e7b5",color:"#76520c"}}><Banknote size={21}/></span><span style={{display:"block"}}>Recebemos seu aparelho como entrada</span></div>}</>:<div className={`commercial-status ${product.commercialStatus}`}>{product.commercialStatus==="coming_soon"?"Em breve":"Aguardando reposição"}</div>}<span className="card-link" style={{marginTop:"auto"}}>Ver produto <ChevronRight size={18}/></span></div></Link></article>;
    })}</div> : <div className="empty-state"><Search size={34}/><h3>Nenhum produto encontrado</h3><p>Ajuste os filtros ou tente outro modelo, marca ou capacidade.</p><button onClick={() => { setQuery(""); selectCategory("todos"); clearFilters(); }}>Limpar busca e filtros</button></div>}
  </section>;
}