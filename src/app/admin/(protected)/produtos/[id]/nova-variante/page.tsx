/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNewVariantWizard } from "@/components/admin-new-variant-wizard";

export default async function NewVariantPage({
  params,
  searchParams,
}:{
  params:Promise<{id:string}>;
  searchParams:Promise<{duplicate?:string}>;
}){
  const {id}=await params;
  const {duplicate}=await searchParams;
  const supabase=await createClient();

  const [{data:product},{data:suppliers}]=await Promise.all([
    supabase.from("products").select("id,name,model,condition,connectivity,brand:brands(name),category:categories(name)").eq("id",id).single(),
    supabase.from("suppliers").select("id,name,code").eq("active",true).order("code"),
  ]);
  if(!product)notFound();

  let prefill:Record<string,unknown>={};
  if(duplicate){
    const {data:variant}=await supabase.from("product_variants")
      .select("*,supplier_offers(supplier_id,cost,external_code,available)")
      .eq("id",duplicate).eq("product_id",id).single();
    if(variant){
      const offer=(variant.supplier_offers??[]).find((item:any)=>item.available)??variant.supplier_offers?.[0];
      prefill={
        ram_gb:variant.ram_gb,storage_gb:variant.storage_gb,color:variant.color,color_hex:variant.color_hex,
        sim_configuration:variant.sim_configuration,condition_grade:variant.condition_grade,
        battery_health_minimum:variant.battery_health_minimum,original_components:variant.original_components,
        never_opened:variant.never_opened,warranty_months:variant.warranty_months,
        condition_details:variant.condition_details,manual_price:variant.manual_price,
        supplier_id:offer?.supplier_id??null,cost:offer?.cost??null,external_code:offer?.external_code??null,
      };
    }
  }

  return <AdminNewVariantWizard
    product={{
      id:product.id,name:product.name,model:product.model,
      condition:product.condition as "novo"|"seminovo",connectivity:product.connectivity,
      brand_name:(product.brand as any)?.name??null,category_name:(product.category as any)?.name??null,
    }}
    suppliers={suppliers??[]}
    prefill={prefill}
  />;
}
