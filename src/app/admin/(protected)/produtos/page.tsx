/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";
import { configuredAutomaticPrice } from "@/lib/pricing";
import { AdminProductSearch, type CatalogRow } from "@/components/admin-product-search";

function normalizeSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR");
}

export default async function ProductsPage() {
  const supabase = await createClient();
  const [{ data }, { data: standardTiers }, { data: accessoryTiers }] = await Promise.all([
    supabase
      .from("products")
      .select("id,name,slug,condition,connectivity,active,catalog_status,brand:brands(name,slug),category:categories(name,slug,pricing_mode),product_variants(id,sku,ram_gb,storage_gb,color,condition_grade,commercial_status,manual_price,supplier_offers(cost,available))")
      .order("name"),
    supabase.from("pricing_tiers").select("*").eq("active", true).order("sort_order"),
    supabase.from("accessory_pricing_tiers").select("*").eq("active", true).order("sort_order"),
  ]);


  const rows: CatalogRow[] = (data ?? []).flatMap((p: any) => (p.product_variants ?? []).map((v: any) => {
    const offer = (v.supplier_offers ?? []).filter((o: any) => o.available).sort((a: any,b: any) => Number(a.cost) - Number(b.cost))[0];
    const cost = Number(offer?.cost ?? 0);
    const auto = configuredAutomaticPrice(cost, p.category?.pricing_mode ?? "standard", standardTiers ?? [], accessoryTiers ?? []);
    const variant = [v.ram_gb ? `${v.ram_gb} GB RAM` : null, v.storage_gb ? `${v.storage_gb} GB` : null, v.color].filter(Boolean).join(" · ");
    const group = p.category?.slug === "iphone" ? "iphone" : p.category?.slug === "smartphones" ? "android" : "other";
    const available = v.commercial_status === "available" && Boolean(offer);
    const availability = available ? "Disponível" : v.commercial_status === "restocking" ? "Reposição" : "Oculta / sem oferta";
    const status = !p.active ? "Inativo" : p.catalog_status === "ready" ? "Publicado" : "Rascunho";
    return {
      id: String(v.id), productId: String(p.id), name: p.name ?? "", brand: p.brand?.name ?? "",
      category: p.category?.name ?? "Sem categoria", categorySlug: p.category?.slug ?? "sem-categoria",
      group, variant, sku: v.sku ?? "", grade: v.condition_grade?.replaceAll("_", " ") ?? "",
      status, availability, cost: cost ? money.format(cost) : "—", price: money.format(Number(v.manual_price ?? auto)),
      manual: v.manual_price !== null && v.manual_price !== undefined, active: Boolean(p.active),
      search: normalizeSearch([p.name,p.brand?.name,p.category?.name,p.condition,p.connectivity,v.sku,variant,v.condition_grade].filter(Boolean).join(" ")),
    } as CatalogRow;
  }));

  return <>
    <div className="admin-heading">
      <div><span className="eyebrow">Catálogo</span><h1>Produtos</h1></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Link className="admin-outline" href="/admin/produtos/novo" aria-label="Cadastrar novo produto"><Plus/> Novo</Link>
        <a className="admin-outline" href="/" target="_blank" rel="noopener noreferrer" aria-label="Ver vitrine"><ExternalLink/></a>
      </div>
    </div>
    <AdminProductSearch rows={rows}/>
  </>;
}
