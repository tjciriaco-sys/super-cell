"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, Pencil, Search, X } from "lucide-react";
import { toggleProduct } from "@/app/admin/actions";
import { AdminSubmitButton } from "@/components/admin-submit-button";

export type CatalogRow = {
  id: string; productId: string; name: string; brand: string; category: string; categorySlug: string;
  group: "iphone" | "android" | "other"; variant: string; sku: string; grade: string;
  status: string; availability: string; cost: string; price: string; manual: boolean;
  active: boolean; search: string;
};

type Group = "all" | "iphone" | "android" | "other";
const groupOptions: { id: Group; label: string }[] = [
  { id: "all", label: "Todos" }, { id: "iphone", label: "iPhones" },
  { id: "android", label: "Androids" }, { id: "other", label: "Outros" },
];
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
const modelCount = (rows: CatalogRow[]) => new Set(rows.map((r) => r.productId)).size;

export function AdminProductSearch({ rows }: { rows: CatalogRow[] }) {
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [category, setCategory] = useState("");
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name");

  const categories = useMemo(() => [...new Map(rows.filter((r) => r.group === "other").map((r) => [r.categorySlug, r.category])).entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "pt-BR")), [rows]);
  const selected = useMemo(() => {
    const needle = normalize(query);
    return rows.filter((r) => (group === "all" || r.group === group)
      && (group !== "other" || !category || r.categorySlug === category)
      && (!needle || r.search.includes(needle))
      && (status === "all" || (status === "published" ? r.status === "Publicado" && r.availability === "Disponível" : status === "available" ? r.availability === "Disponível" : status === "draft" ? r.status === "Rascunho" : r.availability !== "Disponível")))
      .sort((a, b) => sort === "status" ? a.status.localeCompare(b.status, "pt-BR") : a.name.localeCompare(b.name, "pt-BR"));
  }, [rows, group, category, query, status, sort]);
  const counts = useMemo(() => Object.fromEntries(groupOptions.map(({ id }) => {
    const subset = id === "all" ? rows : rows.filter((r) => r.group === id);
    return [id, { models: modelCount(subset), variants: subset.length }];
  })) as Record<Group, { models: number; variants: number }>, [rows]);
  const selectedModels = modelCount(selected);
  const reset = () => { setQuery(""); setGroup("all"); setCategory(""); setStatus("all"); setSort("name"); };
  const hasFilters = Boolean(query || category || group !== "all" || status !== "all");
  return <div className="catalog-admin">
    <div className="catalog-admin-summary" aria-label="Resumo do catálogo">
      <div><strong>{counts.all.models}</strong><span>Modelos cadastrados</span></div>
      <div><strong>{counts.all.variants}</strong><span>Variantes cadastradas</span></div>
    </div>
    <div className="admin-product-tools">
      <div className="admin-search"><Search aria-hidden="true"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto, cor, SKU ou variante" aria-label="Buscar produtos" autoComplete="off" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Limpar busca"><X size={18}/></button>}</div>
      <div className="admin-product-group-filter" role="group" aria-label="Filtrar produtos por grupo">
        {groupOptions.map(({ id, label }) => <button key={id} type="button" className={group === id ? "active" : ""} aria-pressed={group === id} onClick={() => {setGroup(id); setCategory(""); setCategoriesOpen(false);}}><span>{label}</span><small>{counts[id].variants}</small></button>)}
      </div>
      {group === "other" && <div className="catalog-admin-category">
        <button type="button" className="catalog-admin-dropdown" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(!categoriesOpen)}><span>{category ? categories.find(([slug]) => slug === category)?.[1] : "Todas as categorias"}</span><ChevronDown size={18}/></button>
        {categoriesOpen && <div className="catalog-admin-category-list">
          <button type="button" className={!category ? "selected" : ""} onClick={() => {setCategory(""); setCategoriesOpen(false);}}>Todas as categorias <small>{counts.other.variants}</small></button>
          {categories.map(([slug, name]) => <button type="button" className={category === slug ? "selected" : ""} key={slug} onClick={() => {setCategory(slug);setCategoriesOpen(false);}}>{name}<small>{rows.filter((r) => r.categorySlug === slug).length}</small></button>)}
        </div>}
      </div>}
      <div className="catalog-admin-controls">
        <label>Situação<select value={status} onChange={(e)=>setStatus(e.target.value)}><option value="all">Todas</option><option value="published">Na vitrine</option><option value="available">Disponíveis</option><option value="draft">Rascunhos</option><option value="unavailable">Reposição / ocultas</option></select></label>
        <label>Ordenar<select value={sort} onChange={(e)=>setSort(e.target.value)}><option value="name">Nome A–Z</option><option value="status">Situação</option></select></label>
      </div>
      <div className="catalog-admin-result"><span><strong>{selectedModels}</strong> {selectedModels === 1 ? "modelo" : "modelos"} · <strong>{selected.length}</strong> {selected.length === 1 ? "variante" : "variantes"}</span>{hasFilters && <button type="button" onClick={reset}>Limpar filtros</button>}</div>
    </div>
    {selected.length === 0 ? <div className="catalog-admin-empty"><strong>Nenhum produto encontrado</strong><span>Experimente ajustar a busca ou os filtros.</span><button type="button" onClick={reset}>Limpar filtros</button></div> : <>
      <div className="catalog-admin-mobile-list">{selected.map((r) => <article className="catalog-admin-item" key={r.id}>
        <div className="catalog-admin-item-head"><div><strong>{r.name}</strong><small>{r.brand} · {r.category}</small></div><Link href={`/admin/produtos/${r.productId}`} aria-label={`Editar ${r.name}`}><Pencil size={19}/></Link></div>
        <div className="catalog-admin-item-variant">{r.variant || (r.grade || r.sku ? "" : "Variante cadastrada")}{r.grade && <small>{r.grade}</small>}{r.sku && <small>SKU: {r.sku}</small>}</div>
        <div className="catalog-admin-item-bottom"><div><span className="catalog-admin-pill">{r.availability}</span><span className="catalog-admin-pill subtle">{r.status}</span></div><div><small>Pix</small><strong>{r.price}</strong></div></div>
      </article>)}</div>
      <div className="catalog-admin-desktop responsive-table"><table><thead><tr><th>Editar</th><th>Produto</th><th>Variante</th><th>Disponibilidade</th><th>Publicação</th><th>Custo</th><th>Preço Pix</th><th>Manual</th><th>Ações</th></tr></thead><tbody>{selected.map((r)=> <tr key={r.id}><td><div className="row-actions"><Link href={`/admin/produtos/${r.productId}`} aria-label={`Editar ${r.name}`}><Pencil/></Link></div></td><td><strong>{r.name}</strong><small>{r.brand} · {r.category}</small></td><td><strong>{r.variant}</strong><small>{r.sku}{r.grade ? ` · ${r.grade}` : ""}</small></td><td>{r.availability}</td><td><span className={`status ${r.status === "Publicado" ? "on" : "off"}`}>{r.status}</span></td><td>{r.cost}</td><td>{r.price}</td><td>{r.manual ? "Sim" : "Não"}</td><td><form action={toggleProduct}><input type="hidden" name="id" value={r.productId}/><input type="hidden" name="active" value={String(r.active)}/><AdminSubmitButton pendingLabel={r.active ? "Desativando…" : "Ativando…"}>{r.active ? "Desativar" : "Ativar"}</AdminSubmitButton></form></td></tr>)}</tbody></table></div>
    </>}
  </div>;
}
