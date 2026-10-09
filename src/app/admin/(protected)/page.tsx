import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, Boxes, CreditCard, ImageOff, PackageCheck, Truck, AlertTriangle, Clock3 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { auditCatalogImages, type ImageAuditProduct } from "@/lib/catalog-image-audit";

export default async function AdminDashboard(){
  const supabase=await createClient();
  const [products,variants,suppliers,manual,acquirer,updates]=await Promise.all([
    supabase.from("products").select("id,name,slug,active,catalog_status,image_strategy,images,product_variants(active,color,images)"),
    supabase.from("product_variants").select("id,commercial_status", {count:"exact"}),
    supabase.from("suppliers").select("id,name,last_updated_at,active"),
    supabase.from("product_variants").select("id",{count:"exact",head:true}).not("manual_price","is",null),
    supabase.from("payment_acquirers").select("name").eq("is_current",true).maybeSingle(),
    supabase.from("change_log").select("created_at").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);
  const catalogProducts=(products.data??[]) as (ImageAuditProduct&{catalog_status:"draft"|"ready"})[];
  const active=catalogProducts.filter(p=>p.active).length;
  const drafts=catalogProducts.filter(p=>p.catalog_status==="draft").length;
  const inactive=catalogProducts.length-active;
  const availableVariants=(variants.data??[]).filter(v=>v.commercial_status==="available").length;
  const imageIssues=auditCatalogImages(catalogProducts);
  const staleSuppliers=(suppliers.data??[]).filter(s=>s.active&&!s.last_updated_at);
  const alertCount=Number(drafts>0)+Number(inactive>0)+Number(imageIssues.length>0)+staleSuppliers.length;
  const dateText=updates.data?.created_at?new Intl.DateTimeFormat("pt-BR",{dateStyle:"short",timeStyle:"short",timeZone:"America/Fortaleza"}).format(new Date(updates.data.created_at)):"Nenhuma alteração registrada";
  return <div className="admin-operations">
    <div className="admin-heading"><div><span className="eyebrow">Operação Super Cell</span><h1>Visão geral</h1><p>O que acompanhar e resolver no catálogo.</p></div></div>
    <div className="admin-operation-stats">
      <Link href="/admin/produtos" className="admin-operation-stat"><Boxes/><span>Modelos ativos</span><strong>{active}</strong><small>{catalogProducts.length} cadastrados <ArrowUpRight/></small></Link>
      <Link href="/admin/produtos" className="admin-operation-stat"><PackageCheck/><span>Variantes disponíveis</span><strong>{availableVariants}</strong><small>{variants.count??0} cadastradas <ArrowUpRight/></small></Link>
      <Link href="/admin/precificacao" className="admin-operation-stat"><BadgeDollarSign/><span>Preços manuais</span><strong>{manual.count??0}</strong><small>Ver precificação <ArrowUpRight/></small></Link>
      <Link href="/admin/fornecedores" className="admin-operation-stat"><Truck/><span>Fornecedores ativos</span><strong>{(suppliers.data??[]).filter(s=>s.active).length}</strong><small>Ver fornecedores <ArrowUpRight/></small></Link>
    </div>
    <section className="admin-card admin-operation-alerts">
      <div className="admin-operation-section-title"><div><AlertTriangle/><div><strong>Atenção operacional</strong><small>{alertCount? "Itens que precisam de acompanhamento":"Tudo em ordem nos indicadores acompanhados"}</small></div></div><span>{alertCount} grupos</span></div>
      <div className="admin-operation-tasks">
        {drafts>0&&<Link href="/admin/produtos"><span><strong>{drafts} modelos aguardando revisão</strong><small>Aprovar somente após conferir o cadastro</small></span><ArrowUpRight/></Link>}
        {inactive>0&&<Link href="/admin/produtos"><span><strong>{inactive} modelos inativos</strong><small>Não aparecem na vitrine</small></span><ArrowUpRight/></Link>}
        {imageIssues.length>0&&<div className="admin-operation-image-issues"><div><ImageOff/><span><strong>{imageIssues.length} alertas de imagem</strong><small>Conferir fotos e padrões do catálogo</small></span></div>{imageIssues.slice(0,5).map((issue)=><Link key={`${issue.productId}-${issue.reason}`} href={`/admin/produtos/${issue.productId}`}><span>{issue.productName}<small>{issue.detail}</small></span><ArrowUpRight/></Link>)}{imageIssues.length>5&&<small>Mais {imageIssues.length-5} ocorrências identificadas.</small>}</div>}
        {staleSuppliers.map(s=><Link href="/admin/fornecedores" key={s.id}><span><strong>{s.name}: atualização não registrada</strong><small>Conferir a situação da fonte</small></span><ArrowUpRight/></Link>)}
        {!alertCount&&<p className="healthy">Nenhuma pendência detectada nesses critérios.</p>}
      </div>
    </section>
    <section className="admin-card admin-operation-footer"><div><CreditCard/><span>Adquirente ativa</span><strong>{acquirer.data?.name??"Não configurada"}</strong><Link href="/admin/pagamentos" aria-label="Ver pagamentos"><ArrowUpRight/></Link></div><div><Clock3/><span>Última alteração</span><strong>{dateText}</strong><Link href="/admin/historico" aria-label="Ver histórico"><ArrowUpRight/></Link></div></section>
  </div>;
}
