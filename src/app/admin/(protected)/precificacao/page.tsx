import { Calculator, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { money } from "@/lib/utils";
import { PERFUMERY_PRICING } from "@/lib/pricing";
import { PricingCategorySelector } from "@/components/pricing-category-selector";

type SearchParams={categoria?:string};

export default async function PricingPage({searchParams}:{searchParams:Promise<SearchParams>}){
  const supabase=await createClient();
  const params=await searchParams;
  const [{data:tiers},{data:accessoryTiers},{data:costs},{data:settings},{data:categories},{count:manual}]=await Promise.all([
    supabase.from("pricing_tiers").select("*").order("sort_order"),
    supabase.from("accessory_pricing_tiers").select("*").order("sort_order"),
    supabase.from("operational_costs").select("*").single(),
    supabase.from("commercial_settings").select("key,value").in("key",["accessory_delivery_fee","accessory_free_delivery_threshold"]),
    supabase.from("categories").select("name,slug,pricing_mode").eq("active",true).order("sort_order"),
    supabase.from("product_variants").select("id",{count:"exact",head:true}).not("manual_price","is",null),
  ]);
  const policy=Object.fromEntries((settings??[]).map((item)=>[item.key,item.value]));
  const available=categories??[];
  const requested=params.categoria;
  const selected=available.find((item)=>item.slug===requested)??available.find((item)=>item.slug==="smartphones")??available[0];
  const mode=selected?.pricing_mode??"standard";
  const isPerfumery=mode==="perfumery";
  const isAccessory=mode==="accessory";
  const commission=isPerfumery?PERFUMERY_PRICING.commission:Number(costs?.seller_commission_percent??.01);
  const delivery=isPerfumery?PERFUMERY_PRICING.delivery:Number(costs?.delivery_cost??15);
  const packaging=isPerfumery?PERFUMERY_PRICING.packaging:Number(costs?.packaging_cost??1);

  return <>
    <div className="admin-heading"><div><span className="eyebrow">Regra comercial</span><h1>Precificação</h1></div></div>
    <div className="rule-banner"><Info/><div><strong>Marketing não faz parte da precificação unitária.</strong><p>As regras automáticas preservam {manual??0} preço(s) manual(is).</p></div></div>

    <section className="admin-card pricing-category-card">
      <div className="card-title"><div><Calculator/><span><strong>Categoria de precificação</strong><small>Selecione a categoria para visualizar a regra comercial aplicada</small></span></div></div>
      <PricingCategorySelector categories={available.map(({name,slug})=>({name,slug}))} selected={selected?.slug??""}/>
      {selected&&<div className="pricing-category-summary"><span>Categoria selecionada</span><strong>{selected.name}</strong><small>Modo: {isPerfumery?"Perfumaria":isAccessory?"Acessórios":"Padrão"}</small></div>}
    </section>

    {isPerfumery?<section className="admin-card">
      <div className="card-title"><div><Calculator/><span><strong>Perfumaria</strong><small>Margem mínima protegida com arredondamento comercial</small></span></div></div>
      <div className="detail-grid">
        <div><span>Comissão</span><strong>{PERFUMERY_PRICING.commission*100}%</strong></div>
        <div><span>Entrega</span><strong>{money.format(PERFUMERY_PRICING.delivery)}</strong></div>
        <div><span>Embalagem</span><strong>{money.format(PERFUMERY_PRICING.packaging)}</strong></div>
        <div><span>Resultado mínimo</span><strong>{money.format(PERFUMERY_PRICING.targetResult)}</strong></div>
        <div><span>Arredondamento</span><strong>Final ,90</strong></div>
        <div><span>Marketing</span><strong>Verba mensal</strong></div>
      </div>
      <div className="rule-banner compact"><Info/><div><strong>Regra automática</strong><p>Calcula o menor preço que preserva o resultado mínimo e arredonda sempre para cima até o próximo valor terminado em R$ 0,90.</p></div></div>
    </section>:isAccessory?<section className="admin-card">
      <div className="card-title"><div><Calculator/><span><strong>{selected?.name}</strong><small>Multiplicador por faixa de custo com arredondamento comercial</small></span></div></div>
      <div className="pricing-tiers">{(accessoryTiers??[]).map((t)=><div key={t.id}><span>{Number(t.min_cost)===0?`Até ${money.format(Number(t.max_cost))}`:`${money.format(Number(t.min_cost))} até ${money.format(Number(t.max_cost))}`}</span><strong>× {Number(t.multiplier).toLocaleString("pt-BR",{minimumFractionDigits:2})}</strong></div>)}</div>
      <div className="rule-banner compact"><Info/><div><strong>Entrega de acessórios</strong><p>{money.format(Number(policy.accessory_delivery_fee??15))} abaixo de {money.format(Number(policy.accessory_free_delivery_threshold??100))}. Grátis acima do mínimo ou junto com um aparelho.</p></div></div>
    </section>:<section className="admin-card">
      <div className="card-title"><div><Calculator/><span><strong>{selected?.name??"Celulares e eletrônicos principais"}</strong><small>Acréscimo fixo aplicado pelo custo comercial</small></span></div></div>
      <div className="pricing-tiers">{(tiers??[]).map((t)=><div key={t.id}><span>{Number(t.min_cost)===0?`Até ${money.format(Number(t.max_cost))}`:t.max_cost?`${money.format(Number(t.min_cost))} até ${money.format(Number(t.max_cost))}`:`Acima de ${money.format(Number(t.min_cost)-.01)}`}</span><strong>+ {money.format(Number(t.fixed_markup))}</strong></div>)}</div>
    </section>}

    <section className="admin-card">
      <div className="card-title"><strong>Custos operacionais desta categoria</strong></div>
      <div className="detail-grid">
        <div><span>Comissão</span><strong>{commission*100}%</strong></div>
        <div><span>Entrega</span><strong>{isAccessory?"Conforme política":money.format(delivery)}</strong></div>
        <div><span>Embalagem</span><strong>{money.format(packaging)}</strong></div>
        {isPerfumery&&<div><span>Resultado mínimo</span><strong>{money.format(PERFUMERY_PRICING.targetResult)}</strong></div>}
        <div><span>Marketing</span><strong>Verba mensal</strong></div>
      </div>
    </section>
  </>;
}
