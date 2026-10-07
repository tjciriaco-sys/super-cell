"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeDollarSign, ChevronDown, ChevronRight, ListFilter, Search, X } from "lucide-react";
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
const sortOptions:{value:SortMode;label:string;short:string}[]=[
  {value:"featured",label:"Destaques",short:"Destaques"},
  {value:"price_asc",label:"Menor preço → maior preço",short:"Menor preço"},
  {value:"price_desc",label:"Maior preço → menor preço",short:"Maior preço"},
  {value:"name",label:"Nome A–Z",short:"Nome A–Z"},
];
const priceOptions=[
  {value:"todos",label:"Todos"},
  {value:"ate-1000",label:"Até R$ 1.000"},
  {value:"1000-2000",label:"R$ 1–2 mil"},
  {value:"2000-3000",label:"R$ 2–3 mil"},
  {value:"acima-3000",label:"Acima de R$ 3 mil"},
];
const conditionOptions=[{value:"todos",label:"Todas"},{value:"novo",label:"Novo · Lacrado"},{value:"seminovo",label:"Seminovo"}];
const connectivityOptions=[{value:"todos",label:"Todas"},{value:"4G",label:"4G"},{value:"5G",label:"5G"}];
const primaryCategories = [
  { slug: "iphones", label: "iPhones" },
  { slug: "androids", label: "Androids" },
];
const secondaryCategories = [
  { slug: "tablets", label: "Tablets" },
  { slug: "smartwatches", label: "Smartwatches" },
  { slug: "perfumaria", label: "Perfumaria" },
  { slug: "projetores", label: "Projetores" },
  { slug: "receptores", label: "Receptores" },
  { slug: "cabos-carregadores", label: "Cabos e carregadores", compact: true },
  { slug: "caixas-de-som", label: "Caixas de som" },
  { slug: "fones-de-ouvido", label: "Fones de ouvido" },
  { slug: "power-banks", label: "Power banks" },
];

function matchesCategory(variant: CatalogVariant, category: string) {
  if (category === "todos") return true;
  if (category === "iphones") return /iphone/i.test(`${variant.category_slug} ${variant.category_name} ${variant.product_name} ${variant.model}`);
  if (category === "androids") return variant.brand_slug !== "apple" && /smartphone|celular|android/i.test(`${variant.category_slug} ${variant.category_name}`);
  if (category === "tablets") return /tablet/i.test(variant.category_slug);
  if (category === "smartwatches") return /smartwatch|relogio|relógio/i.test(`${variant.category_slug} ${variant.category_name}`);
  if (category === "cabos-carregadores") return variant.category_slug === "cabos" || variant.category_slug === "carregadores";
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
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState("todos");
  const [condition, setCondition] = useState("todos");
  const [storage, setStorage] = useState("todos");
  const [connectivity, setConnectivity] = useState("todos");
  const [otherOpen, setOtherOpen] = useState(false);

  const otherCategories = useMemo(
    () => secondaryCategories.filter((item) => variants.some((variant) => matchesCategory(variant, item.slug))),
    [variants],
  );
  const defaultCategory = variants.some((variant) => matchesCategory(variant, "iphones")) ? "iphones" : variants.some((variant) => matchesCategory(variant, "androids")) ? "androids" : "todos";
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
    const items: ProductGroup[] = filteredVariants.map((variant) => ({
      key: variant.variant_id,
      variantId: variant.variant_id,
      slug: variant.slug,
      name: catalogProductName(variant),
      brand: variant.brand_name,
      category: variant.category_slug,
      condition: variant.condition,
      conditionGrade: variant.condition_grade,
      connectivity: variant.connectivity,
      pricingMode: variant.pricing_mode,
      price: variant.price_pix === null ? null : Number(variant.price_pix),
      supplierCode: variant.supplier_code,
      image: variant.images?.[0] ?? variant.storefront_image ?? undefined,
      badges: variant.badges,
      variant: [variant.ram_gb ? `${variant.ram_gb} GB` : null, variant.storage_gb ? `${variant.storage_gb} GB` : null].filter(Boolean).join(" + "),
      colors: variant.color ? [variant.color] : [],
      commercialStatus: variant.commercial_status,
      batteryHealth: variant.condition === "seminovo" ? variant.battery_health_minimum : null,
    }));

    return items.sort((a, b) => {
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
    <div className="section-heading"><div><span className="eyebrow">📱 Escolha com segurança</span><h2>Encontre seu próximo aparelho</h2></div><span className="catalog-total-badge" aria-label="Mais de 100 opções no catálogo"><strong>100+</strong><small>opções no catálogo</small></span></div>
    <div className="catalog-tools">
      <label className="search-field"><Search size={20}/><span className="sr-only">Buscar produtos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="O que você procura?"/></label>
      <div className="category-primary-grid" role="group" aria-label="Categorias principais">
        {primaryCategories.map((item) => <button key={item.slug} className={`category-primary-button ${category === item.slug ? "active" : ""}`} onClick={() => selectCategory(item.slug)} aria-pressed={category === item.slug}>{item.label}</button>)}
        <button className={`category-primary-button category-primary-more ${otherCategories.some((item) => item.slug === category) ? "active" : ""}`} onClick={() => setOtherOpen((open) => !open)} aria-expanded={otherOpen} disabled={otherCategories.length === 0}><span className="category-button-label"><strong>Outros</strong><small>produtos</small></span><ChevronDown/></button>
      </div>
    </div>
    {otherOpen && <div className="other-categories" aria-label="Outras categorias">{otherCategories.map((item) => <button key={item.slug} className={"compact" in item && item.compact ? "compact-label" : ""} onClick={() => selectCategory(item.slug)}>{item.label}</button>)}</div>}
    <div className="catalog-controls">
      <div className="sort-control">
        <button className={`sort-trigger ${sortOpen?"active":""}`} type="button" onClick={()=>setSortOpen((open)=>!open)} aria-expanded={sortOpen}><span>Ordenar</span><strong>{sortOptions.find((item)=>item.value===sort)?.short}</strong><ChevronDown/></button>
        {sortOpen&&<div className="sort-menu" role="menu">{sortOptions.map((item)=><button type="button" key={item.value} className={sort===item.value?"selected":""} onClick={()=>{setSort(item.value);setSortOpen(false)}}>{item.label}</button>)}</div>}
      </div>
      <button className={filtersOpen ? "active" : ""} onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><ListFilter/> Filtros{activeFilterCount > 0 && <b>{activeFilterCount}</b>}</button>
    </div>
    {filtersOpen && <div className="filter-panel">
      <div className="filter-panel-head"><div><strong>Filtrar produtos</strong><small>Toque nas opções para refinar a vitrine.</small></div>{activeFilterCount > 0 && <button onClick={clearFilters}><X/> Limpar</button>}</div>
      <div className="filter-fields-modern">
        <div className="filter-group"><span>Faixa de preço</span><div>{priceOptions.map((item)=><button type="button" key={item.value} className={priceRange===item.value?"selected":""} onClick={()=>setPriceRange(item.value)}>{item.label}</button>)}</div></div>
        <div className="filter-group"><span>Condição</span><div>{conditionOptions.map((item)=><button type="button" key={item.value} className={condition===item.value?"selected":""} onClick={()=>setCondition(item.value)}>{item.label}</button>)}</div></div>
        <div className="filter-group"><span>Armazenamento</span><div><button type="button" className={storage==="todos"?"selected":""} onClick={()=>setStorage("todos")}>Todos</button>{storageOptions.map((value)=><button type="button" key={value} className={storage===String(value)?"selected":""} onClick={()=>setStorage(String(value))}>{value} GB</button>)}</div></div>
        <div className="filter-group"><span>Conectividade</span><div>{connectivityOptions.map((item)=><button type="button" key={item.value} className={connectivity===item.value?"selected":""} onClick={()=>setConnectivity(item.value)}>{item.label}</button>)}</div></div>
      </div>
    </div>}
    {products.length ? <div className="product-grid">{products.map((product, index) => {
      const isAvailable=product.commercialStatus==="available"&&product.price!==null;
      const paidDelivery = isAvailable && product.pricingMode === "accessory" && product.price! < accessoryFreeThreshold;
      const displayBase = (product.price??0) + (paidDelivery ? accessoryDeliveryFee : 0);
      const total = displayBase * primaryFactor;
      const badge = product.badges.find((item) => ![product.condition, "novo", "lacrado", "seminovo"].includes(item.toLowerCase()));
      const acceptsTradeIn = /iphone/i.test(product.category) || product.brand.toLowerCase()==="apple";
      const detailChipStyle = {background:"linear-gradient(135deg,rgba(255,252,243,.42),rgba(247,238,214,.28))",color:"#74684f",border:"1px solid rgba(214,193,143,.42)",borderRadius:5,padding:"1px 5px",fontSize:8.5,fontWeight:800,lineHeight:1.2,whiteSpace:"nowrap"} as const;
      const tagStyle = {background:"transparent",color:"#8a6a26",border:0,borderRadius:0,padding:0,fontSize:9,fontWeight:800,lineHeight:1.15,boxShadow:"none",whiteSpace:"nowrap"} as const;
      return <article className="product-card" key={product.key}><Link href={`/produto/${product.slug}?variante=${product.variantId}`} aria-label={`Ver ${product.name}${product.conditionGrade ? ` em estado ${gradeLabels[product.conditionGrade]}` : ""}`}><ProductImage src={product.image} alt={product.name} priority={index < 2}/><div className="card-body" style={{display:"flex",flexDirection:"column"}}><div className="badges" style={{height:"auto",minHeight:12,overflow:"visible",marginBottom:6,display:"flex",alignItems:"center",justifyContent:"flex-start",gap:"3px 7px",flexWrap:"wrap"}}>{product.brand.toLowerCase()==="apple"&&<span style={tagStyle}>#Apple</span>}{product.condition === "novo" && <span style={tagStyle}>#Novo · Lacrado</span>}{product.condition === "seminovo" && <span style={tagStyle}>#Seminovo</span>}{product.condition === "seminovo" && product.brand.toLowerCase()==="apple" ? <span style={tagStyle}>#Excelente</span> : product.conditionGrade && <span style={tagStyle}>#{gradeLabels[product.conditionGrade]}</span>}{badge && <span style={tagStyle}>#{badge}</span>}</div><div style={{display:"grid",gap:0,textAlign:"left"}}><h3 style={{minHeight:0,margin:0,textAlign:"left"}}>{product.name}</h3>{(product.colors.length > 0 || product.variant || product.batteryHealth !== null) && <div style={{display:"flex",alignItems:"center",justifyContent:"flex-start",alignSelf:"stretch",gap:4,flexWrap:"nowrap",margin:"3px 0 0",minWidth:0,textAlign:"left"}}>{product.colors.length > 0 && <span style={detailChipStyle}>🎨 {product.colors.length > 1 ? `${product.colors.length} cores` : product.colors[0]}</span>}{product.variant && <span style={detailChipStyle}>{product.variant}</span>}{product.batteryHealth !== null && <span style={detailChipStyle}>🔋 {product.batteryHealth}%</span>}</div>}</div>{isAvailable?<><div style={{display:"flex",flexDirection:"column",alignItems:"stretch",justifyContent:"center",margin:"22px 0 20px"}}><div className="price-block" style={{justifyContent:"flex-start",margin:0}}><strong>{money.format(product.price!)}</strong><span>💸 no Pix</span>{product.supplierCode&&<sup className="supplier-code">{product.supplierCode}</sup>}</div><p className="installment-line" style={{margin:"4px 0 0",textAlign:"left",minHeight:0}}>💳 ou {primaryInstallments}x de <strong>{money.format(total / primaryInstallments)}</strong></p></div>{product.pricingMode === "accessory"&&<p className={`card-delivery-note ${paidDelivery?"paid":"free"}`}>{paidDelivery?`🚚 + ${money.format(accessoryDeliveryFee)} de entrega`:`🚚 Entrega grátis`}</p>}{acceptsTradeIn&&<div style={{display:"grid",gridTemplateColumns:"22px minmax(0,1fr)",alignItems:"center",gap:5,margin:"0 0 10px",padding:"4px 6px",border:"1px solid rgba(224,199,139,.42)",borderRadius:8,background:"linear-gradient(135deg,rgba(255,255,255,.76),rgba(255,250,236,.34))",color:"#71561f",fontSize:9,fontWeight:780,lineHeight:1.16,textAlign:"left"}}><span aria-hidden="true" style={{width:22,height:22,display:"grid",placeItems:"center",borderRadius:7,background:"rgba(246,231,181,.34)",color:"#8d6b1d"}}><BadgeDollarSign size={16}/></span><span style={{display:"block"}}>Recebemos seu aparelho como entrada</span></div>}</>:<div className={`commercial-status ${product.commercialStatus}`}>{product.commercialStatus==="coming_soon"?"Em breve":"Aguardando reposição"}</div>}<span className="card-link" style={{marginTop:"auto"}}>Ver produto <ChevronRight size={18}/></span></div></Link></article>;
    })}</div> : <div className="empty-state"><Search size={34}/><h3>Nenhum produto encontrado</h3><p>Ajuste os filtros ou tente outro modelo, marca ou capacidade.</p><button onClick={() => { setQuery(""); selectCategory("todos"); clearFilters(); }}>Limpar busca e filtros</button></div>}
  </section>;
}