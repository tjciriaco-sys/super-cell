/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ArrowLeft, CopyPlus, PackagePlus, Save, SlidersHorizontal } from "lucide-react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";
import { configuredAutomaticPrice } from "@/lib/pricing";
import { saveImageStrategy, saveManualPrice } from "@/app/admin/actions";
import { AdminProductImageUpload } from "@/components/admin-product-image-upload";
import { AdminProductStatusControls } from "@/components/admin-product-status-controls";
import { AdminSubmitButton } from "@/components/admin-submit-button";
import { AdminVariantAvailability } from "@/components/admin-variant-availability";
import { AdminVariantHeader } from "@/components/admin-variant-header";
import { AdminVariantFilter } from "@/components/admin-variant-filter";

export default async function EditProduct({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const supabase=await createClient();
  const [{data:p},{data:standardTiers},{data:accessoryTiers},{data:costs}]=await Promise.all([supabase.from("products").select("*,brand:brands(name),category:categories(name,pricing_mode),product_variants(*,supplier_offers(cost,available,supplier:suppliers(code,name)))").eq("id",id).single(),supabase.from("pricing_tiers").select("*").eq("active",true).order("sort_order"),supabase.from("accessory_pricing_tiers").select("*").eq("active",true).order("sort_order"),supabase.from("operational_costs").select("*").single()]);
  if(!p)notFound();
  const variants=[...(p.product_variants??[])].sort((a:any,b:any)=>{
    const rank=(status:string)=>status==="available"?0:status==="restocking"?1:2;
    return rank(a.commercial_status)-rank(b.commercial_status)||String(a.color??"").localeCompare(String(b.color??""),"pt-BR");
  });
  const availableCount=variants.filter((v:any)=>v.commercial_status==="available").length;
  const restockingCount=variants.filter((v:any)=>v.commercial_status==="restocking").length;
  const hiddenCount=variants.filter((v:any)=>v.commercial_status==="hidden").length;
  const colors=[...new Set(variants.map((v:any)=>v.color).filter(Boolean))];
  const storefrontCount=p.catalog_status==="ready"?availableCount:0;
  const batteryInName=String(p.name).match(/\s*[·|–-]\s*Bateria\s*(\d{1,3})%\s*$/i);
  const displayName=batteryInName?String(p.name).slice(0,batteryInName.index).trim():p.name;
  const batteryDetail=batteryInName?`Bateria ${batteryInName[1]}%`:null;
  const subtitle=[p.brand?.name,p.category?.name,p.condition,p.connectivity,batteryDetail].filter(Boolean).join(" · ");
  return <>
    <div className="admin-heading product-admin-heading"><div><Link className="back-link" href="/admin/produtos"><ArrowLeft/> Produtos</Link><h1>{displayName}</h1><p>{subtitle}</p></div><Link className="admin-primary-link" href={`/admin/produtos/${p.id}/nova-variante`}><PackagePlus/> Nova variante</Link></div>
    <section className="admin-card product-dashboard"><div className="card-title"><div><strong>Visão do modelo</strong></div></div><div className="product-dashboard-grid"><div><span>Variantes</span><strong>{variants.length}</strong><small>{colors.join(" · ")||"Sem cores cadastradas"}</small></div><div><span>Disponíveis</span><strong>{availableCount}</strong><small>{availableCount===1?"variante pronta para venda":"variantes prontas para venda"}</small></div><div><span>Na vitrine</span><strong>{storefrontCount}</strong><small>{p.catalog_status==="ready"?"Publicação aprovada":"Aguardando revisão do modelo"}</small></div><div><span>Reposição</span><strong>{restockingCount}</strong><small>{hiddenCount?`${hiddenCount} oculta(s)`:"Nenhuma oculta"}</small></div></div><AdminProductStatusControls productId={p.id} catalogStatus={(p.catalog_status??"draft") as "draft"|"ready"} commercialStatus={(p.commercial_status??"available") as "available"|"coming_soon"|"restocking"}/><details className="product-advanced-settings"><summary><SlidersHorizontal/> Configurações avançadas do modelo</summary><form action={saveImageStrategy} className="price-form"><input type="hidden" name="product_id" value={p.id}/><label>Estratégia visual<select name="image_strategy" defaultValue={p.image_strategy??"variant"}><option value="variant">Uma imagem própria para cada cor</option><option value="group">Uma foto coletiva mostra todas as cores</option></select></label><label>Capa da vitrine<input name="storefront_image" defaultValue={p.storefront_image??""} placeholder="/products/capa-multicolor.webp"/></label><AdminSubmitButton><Save/> Salvar padrão</AdminSubmitButton></form></details></section>
    <section className="admin-card">
      <div className="variants-manager-head"><div><strong>Variantes</strong><small>Disponibilidade sempre visível. Abra somente o grupo que precisa editar.</small></div><Link className="admin-primary-link compact" href={`/admin/produtos/${p.id}/nova-variante`}><PackagePlus/> Nova variante</Link></div><AdminVariantFilter counts={{all:variants.length,available:availableCount,restocking:restockingCount}}/>
      <div className="variant-admin-list">{variants.map((v:any,index:number)=>{
        const offers=v.supplier_offers.filter((o:any)=>o.available).sort((a:any,b:any)=>Number(a.cost)-Number(b.cost));
        const cost=Number(offers[0]?.cost??0);const mode=(p.category?.pricing_mode??"standard") as "standard"|"accessory"|"perfumery";const auto=configuredAutomaticPrice(cost,mode,standardTiers??[],accessoryTiers??[]);const current=Number(v.manual_price??auto);const commission=Number(costs?.seller_commission_percent??.01);const operational=Number(costs?.delivery_cost??15)+Number(costs?.packaging_cost??1);const result=current-cost-current*commission-operational;
        return <form action={saveManualPrice} key={v.id} className="variant-admin-card" data-admin-variant-card data-status={v.commercial_status}>
          <input type="hidden" name="variant_id" value={v.id}/>
          <AdminVariantHeader variantId={v.id} productName={p.name} index={index+1} total={variants.length} ramGb={v.ram_gb} storageGb={v.storage_gb} color={v.color} colorHex={v.color_hex} sku={v.sku} conditionGrade={v.condition_grade} battery={v.battery_health_minimum} pricingModeLabel={v.manual_price?"Preço manual":"Automático"} isManualPrice={Boolean(v.manual_price)} commercialStatus={(v.commercial_status??"available") as "available"|"restocking"|"hidden"} catalogReady={p.catalog_status==="ready"} publicHref={p.catalog_status==="ready"&&v.commercial_status==="available"?`/produto/${p.slug}?variante=${encodeURIComponent(v.id)}`:null}/><div className="variant-workflow-block"><div className="variant-workflow-title">Disponibilidade</div><AdminVariantAvailability variantId={v.id} initialStatus={(v.commercial_status??"available") as "available"|"restocking"|"hidden"}/></div><div className="variant-quick-actions"><Link href={`/admin/produtos/${p.id}/nova-variante?duplicate=${encodeURIComponent(v.id)}`}><CopyPlus/> Duplicar variante</Link></div>
          
          {v.commercial_status==="available"&&<><details className="variant-detail-group"><summary>Imagem desta variante <span>{v.images?.[0]?"✓ cadastrada":"pendente"}</span></summary><AdminProductImageUpload variantId={v.id} currentImage={v.images?.[0]??null} canApplyToEquivalentVariants={Boolean(v.color)}/></details>
          {p.condition==="seminovo"&&<details className="variant-detail-group"><summary>Condição do seminovo <span>{v.condition_grade?.replace("_"," ")??"não definida"} · {v.battery_health_minimum?`${v.battery_health_minimum}%`:"bateria pendente"}</span></summary><fieldset className="used-admin-settings"><legend>Condição do seminovo</legend><p>O padrão é Excelente. Altere somente quando esta unidade for uma exceção.</p><div><label>Classificação<select name="condition_grade" defaultValue={v.condition_grade??"excelente"}><option value="excelente">Excelente</option><option value="muito_bom">Muito bom</option><option value="bom">Bom</option></select></label><label>Bateria mínima (%)<input name="battery_health_minimum" type="number" min="1" max="100" defaultValue={v.battery_health_minimum??85}/></label><label>Componentes 100% originais?<select name="original_components" defaultValue={String(v.original_components??true)}><option value="true">Sim</option><option value="false">Não</option></select></label><label>Nunca foi aberto?<select name="never_opened" defaultValue={String(v.never_opened??true)}><option value="true">Sim</option><option value="false">Não</option></select></label><label>Garantia Super Cell (meses)<input name="warranty_months" type="number" min="0" max="60" defaultValue={v.warranty_months??3}/></label><label>Observações da condição<input name="condition_details" maxLength={500} defaultValue={v.condition_details??""} placeholder="Ex.: tela substituída, marcas na lateral..."/></label></div><AdminSubmitButton><Save/> Salvar condição</AdminSubmitButton></fieldset></details>}
          <details className="variant-detail-group"><summary>Preço e margem <span>{money.format(current)} no Pix</span></summary><div className="finance-preview"><div><span>Custo atual</span><strong>{money.format(cost)}</strong></div><div><span>Preço automático</span><strong>{money.format(auto)}</strong></div><div><span>Comissão {(commission*100).toLocaleString("pt-BR")}%</span><strong>{money.format(current*commission)}</strong></div><div><span>Entrega + embalagem</span><strong>{money.format(operational)}</strong></div><div className="result"><span>Resultado estimado</span><strong>{money.format(result)}</strong></div></div><div className="price-form"><label>Regra de preço<select name="mode" defaultValue={v.manual_price?"manual":"automatic"}><option value="automatic">Usar preço automático</option><option value="manual">Substituir preço automático</option></select></label><label>Novo preço Pix<input name="manual_price" type="number" min="0" step="0.01" defaultValue={v.manual_price??auto}/></label><label>Motivo<select name="reason" defaultValue={v.manual_price_reason??""}><option value="">Sem motivo</option><option>Promoção</option><option>Preço de mercado</option><option>Queima de estoque</option><option>Ação comercial</option><option>Outro</option></select></label><AdminSubmitButton><Save/> Salvar alterações</AdminSubmitButton></div></details>
          <details className="variant-offers"><summary>Ofertas internas ({offers.length})</summary>{offers.map((o:any)=><p key={`${o.supplier.code}-${o.cost}`}>{o.supplier.code} · {o.supplier.name} — {money.format(Number(o.cost))}</p>)}</details></>}
        </form>;
      })}</div>
    </section>
  </>;
}
