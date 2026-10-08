"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ProductStatusActionState={
  status:"idle"|"success"|"error";
  message:string;
};

async function assertAdmin(){
  const supabase=await createClient();
  const {data:claimData}=await supabase.auth.getClaims();
  const claims=claimData?.claims;
  if(!claims?.sub)throw new Error("Sessão expirada. Entre novamente no painel.");
  const {data}=await supabase.from("admin_profiles").select("role").eq("user_id",claims.sub).eq("active",true).single();
  if(!data)throw new Error("Acesso não autorizado.");
  return supabase;
}

async function refreshProductPaths(productId:string){
  const supabase=await createClient();
  const {data}=await supabase.from("products").select("slug").eq("id",productId).single();
  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  if(data?.slug)revalidatePath(`/produto/${data.slug}`);
}

export async function saveCommercialStatusWithFeedback(
  _previousState:ProductStatusActionState,
  formData:FormData,
):Promise<ProductStatusActionState>{
  try{
    const supabase=await assertAdmin();
    const productId=z.string().uuid().parse(formData.get("product_id"));
    const commercialStatus=z.enum(["available","coming_soon","restocking"]).parse(formData.get("commercial_status"));

    if(commercialStatus==="available"){
      const {data:variants,error:variantsError}=await supabase
        .from("product_variants")
        .select("id")
        .eq("product_id",productId)
        .eq("active",true);

      if(variantsError)return{status:"error",message:"Não foi possível verificar as variantes deste produto."};
      const variantIds=(variants??[]).map((item)=>item.id);
      if(!variantIds.length)return{status:"error",message:"Este produto não possui variante ativa e não pode ser marcado como disponível."};

      const {data:offers,error:offersError}=await supabase
        .from("supplier_offers")
        .select("id,variant_id,cost,available,updated_at,supplier:suppliers!inner(active)")
        .in("variant_id",variantIds)
        .gt("cost",0)
        .eq("supplier.active",true)
        .order("updated_at",{ascending:false});

      if(offersError)return{status:"error",message:"Não foi possível verificar as ofertas de fornecedor."};

      const chosenIds:string[]=[];
      const missing:string[]=[];
      for(const variantId of variantIds){
        const offer=(offers??[]).find((item)=>item.variant_id===variantId);
        if(!offer)missing.push(variantId);
        else chosenIds.push(offer.id);
      }

      if(missing.length){
        return{
          status:"error",
          message:`Não foi possível marcar como disponível: ${missing.length} variante(s) não possuem custo válido de fornecedor.`,
        };
      }

      const {error:offerUpdateError}=await supabase
        .from("supplier_offers")
        .update({available:true,updated_at:new Date().toISOString()})
        .in("id",chosenIds);

      if(offerUpdateError)return{status:"error",message:"Não foi possível reativar as ofertas válidas deste produto."};
    }

    const {error}=await supabase
      .from("products")
      .update({commercial_status:commercialStatus,updated_at:new Date().toISOString()})
      .eq("id",productId);

    if(error)return{status:"error",message:`Não foi possível alterar a situação comercial: ${error.message}`};

    await refreshProductPaths(productId);

    const labels={available:"Disponível",coming_soon:"Em breve",restocking:"Aguardando reposição"} as const;
    return{
      status:"success",
      message:commercialStatus==="available"
        ? "Produto marcado como disponível e ofertas válidas reativadas."
        : `Situação comercial alterada para “${labels[commercialStatus]}”.`,
    };
  }catch(error){
    return{status:"error",message:error instanceof Error?error.message:"Não foi possível alterar a situação comercial."};
  }
}

export async function saveCatalogStatusWithFeedback(
  _previousState:ProductStatusActionState,
  formData:FormData,
):Promise<ProductStatusActionState>{
  try{
    const supabase=await assertAdmin();
    const productId=z.string().uuid().parse(formData.get("product_id"));
    const catalogStatus=z.enum(["draft","ready"]).parse(formData.get("catalog_status"));

    const {error}=await supabase
      .from("products")
      .update({catalog_status:catalogStatus,updated_at:new Date().toISOString()})
      .eq("id",productId);

    if(error){
      const raw=error.message||"";
      if(raw.includes("oferta e custo válidos")){
        return{
          status:"error",
          message:"Ainda não é possível publicar: existe variante sem oferta ativa e custo válido. Salve primeiro a Situação comercial como “Disponível” para reativar as ofertas válidas.",
        };
      }
      if(raw.includes("Cada cor precisa")){
        return{status:"error",message:"Ainda não é possível publicar: cada cor precisa ter uma imagem própria e diferente."};
      }
      if(raw.includes("Produto sem imagem")){
        return{status:"error",message:"Ainda não é possível publicar: falta imagem em uma ou mais variantes."};
      }
      if(raw.includes("sem variante ativa")){
        return{status:"error",message:"Ainda não é possível publicar: o produto não possui variante ativa."};
      }
      return{status:"error",message:`Não foi possível alterar o status do catálogo: ${raw}`};
    }

    await refreshProductPaths(productId);
    return{
      status:"success",
      message:catalogStatus==="ready"
        ? "QA aprovado. O produto já pode aparecer na vitrine quando estiver disponível."
        : "Produto movido para rascunho e ocultado da vitrine.",
    };
  }catch(error){
    return{status:"error",message:error instanceof Error?error.message:"Não foi possível alterar o status do catálogo."};
  }
}
