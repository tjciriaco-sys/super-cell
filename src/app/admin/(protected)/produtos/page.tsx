/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ExternalLink, Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";
import { configuredAutomaticPrice } from "@/lib/pricing";
import { toggleProduct } from "@/app/admin/actions";
import { AdminProductSearch } from "@/components/admin-product-search";
import { AdminSubmitButton } from "@/components/admin-submit-button";

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
      .select("id,name,slug,condition,connectivity,active,catalog_status,brand:brands(name),category:categories(name,pricing_mode),product_variants(id,sku,ram_gb,storage_gb,color,condition_grade,manual_price,supplier_offers(cost,available))")
      .order("name"),
    supabase.from("pricing_tiers").select("*").eq("active", true).order("sort_order"),
    supabase.from("accessory_pricing_tiers").select("*").eq("active", true).order("sort_order"),
  ]);

  return <>
    <div className="admin-heading">
      <div><span className="eyebrow">Catálogo</span><h1>Produtos</h1></div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <Link className="admin-outline" href="/admin/produtos/novo" aria-label="Cadastrar novo produto"><Plus/> Novo</Link>
        <a className="admin-outline" href="/" target="_blank" aria-label="Ver vitrine"><ExternalLink/></a>
      </div>
    </div>

    <AdminProductSearch />

    <section className="admin-card table-card">
      <div className="responsive-table">
        <table>
          <thead><tr><th>Editar</th><th>Produto</th><th>Variante</th><th>Status</th><th>Custo</th><th>Preço Pix</th><th>Manual</th><th>Ações</th></tr></thead>
          <tbody>{(data ?? []).flatMap((p: any) => p.product_variants.map((v: any, index: number) => {
            const offer = v.supplier_offers?.filter((o: any) => o.available).sort((a: any, b: any) => Number(a.cost) - Number(b.cost))[0];
            const cost = Number(offer?.cost ?? 0);
            const auto = configuredAutomaticPrice(cost, p.category?.pricing_mode ?? "standard", standardTiers ?? [], accessoryTiers ?? []);
            const variantLabel = [v.ram_gb ? `${v.ram_gb} GB` : null, v.storage_gb ? `${v.storage_gb} GB` : null, v.color].filter(Boolean).join(" · ");
            const searchText = normalizeSearch([p.name, p.brand?.name, p.category?.name, p.condition, p.connectivity, v.sku, variantLabel, v.condition_grade].filter(Boolean).join(" "));

            return <tr key={v.id} data-admin-product-row data-search={searchText}>
              <td><div className="row-actions"><Link href={`/admin/produtos/${p.id}`} aria-label={`Editar ${p.name}`}><Pencil/></Link></div></td>
              <td>{index === 0 && <div><strong>{p.name}</strong><small>{p.brand?.name} · {p.category?.name}</small></div>}</td>
              <td><strong>{variantLabel}</strong><small>{v.sku}{v.condition_grade ? ` · ${v.condition_grade.replace("_", " ")}` : ""}</small></td>
              <td><span className={`status ${p.active && p.catalog_status === "ready" ? "on" : "off"}`}>{!p.active ? "Inativo" : p.catalog_status === "ready" ? "Publicado" : "Rascunho"}</span></td>
              <td>{cost ? money.format(cost) : "—"}</td>
              <td>{money.format(Number(v.manual_price ?? auto))}</td>
              <td>{v.manual_price ? <span className="manual-tag">Sim</span> : "Não"}</td>
              <td>{index === 0 && <form action={toggleProduct}><input type="hidden" name="id" value={p.id}/><input type="hidden" name="active" value={String(p.active)}/><AdminSubmitButton pendingLabel={p.active?"Desativando…":"Ativando…"}>{p.active ? "Desativar" : "Ativar"}</AdminSubmitButton></form>}</td>
            </tr>;
          }))}</tbody>
        </table>
      </div>
    </section>
  </>;
}
