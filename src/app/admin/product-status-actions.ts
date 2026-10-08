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
      if(raw.includes("Variante disponível exige oferta")){
        return{status:"error",message:"Ainda não é possível publicar: existe uma variante marcada como disponível sem oferta ativa e custo válido."};
      }
      if(raw.includes("Cada cor disponível precisa")){
        return{status:"error",message:"Ainda não é possível publicar: cada cor disponível precisa ter uma imagem própria e diferente."};
      }
      if(raw.includes("sem imagem")){
        return{status:"error",message:"Ainda não é possível publicar: existe variante disponível sem imagem."};
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
        ? "Revisão aprovada. As variantes disponíveis já podem aparecer na vitrine."
        : "Produto movido para rascunho e ocultado da vitrine.",
    };
  }catch(error){
    return{status:"error",message:error instanceof Error?error.message:"Não foi possível alterar o status do catálogo."};
  }
}

export async function setVariantCommercialStatus(input:{
  variantId:string;
  status:"available"|"restocking"|"hidden";
}):Promise<ProductStatusActionState>{
  try{
    const supabase=await assertAdmin();
    const variantId=z.string().uuid().parse(input.variantId);
    const status=z.enum(["available","restocking","hidden"]).parse(input.status);

    const {data:variant,error:variantError}=await supabase
      .from("product_variants")
      .select("id,product_id,color,sku")
      .eq("id",variantId)
      .single();

    if(variantError||!variant)return{status:"error",message:"Variante não encontrada."};

    if(status==="available"){
      const {data:offers,error:offersError}=await supabase
        .from("supplier_offers")
        .select("id,cost,updated_at,supplier:suppliers!inner(active)")
        .eq("variant_id",variantId)
        .gt("cost",0)
        .eq("supplier.active",true)
        .order("cost",{ascending:true})
        .order("updated_at",{ascending:false});

      if(offersError)return{status:"error",message:"Não foi possível verificar as ofertas desta variante."};
      const offer=offers?.[0];
      if(!offer)return{status:"error",message:"Esta cor não pode ser marcada como disponível porque não possui custo válido de fornecedor."};

      const {error:offerUpdateError}=await supabase
        .from("supplier_offers")
        .update({available:true,updated_at:new Date().toISOString()})
        .eq("id",offer.id);

      if(offerUpdateError)return{status:"error",message:"Não foi possível reativar a oferta válida desta variante."};
    }

    if(status==="restocking"){
      const {error:offersError}=await supabase
        .from("supplier_offers")
        .update({available:false,updated_at:new Date().toISOString()})
        .eq("variant_id",variantId);

      if(offersError)return{status:"error",message:"Não foi possível marcar as ofertas desta variante como indisponíveis."};
    }

    const {error}=await supabase
      .from("product_variants")
      .update({commercial_status:status,updated_at:new Date().toISOString()})
      .eq("id",variantId);

    if(error)return{status:"error",message:`Não foi possível alterar a disponibilidade desta variante: ${error.message}`};

    await refreshProductPaths(variant.product_id);

    const name=variant.color||variant.sku||"Variante";
    const labels={
      available:"Disponível — aparece na vitrine",
      restocking:"Aguardando reposição — não aparece",
      hidden:"Oculta — não aparece",
    } as const;

    return{status:"success",message:`${name}: ${labels[status]}.`};
  }catch(error){
    return{status:"error",message:error instanceof Error?error.message:"Não foi possível alterar a disponibilidade desta variante."};
  }
}


export async function saveVariantIdentity(input:{
  variantId:string;
  color:string;
  colorHex:string|null;
}):Promise<ProductStatusActionState>{
  try{
    const supabase=await assertAdmin();
    const variantId=z.string().uuid().parse(input.variantId);
    const color=z.string().trim().min(2).max(50).parse(input.color);
    const colorHex=input.colorHex?z.string().regex(/^#[0-9A-Fa-f]{6}$/).parse(input.colorHex):null;

    const {data:variant,error:variantError}=await supabase
      .from("product_variants")
      .select("product_id")
      .eq("id",variantId)
      .single();

    if(variantError||!variant)return{status:"error",message:"Variante não encontrada."};

    const {error}=await supabase
      .from("product_variants")
      .update({color,color_hex:colorHex,updated_at:new Date().toISOString()})
      .eq("id",variantId);

    if(error)return{status:"error",message:`Não foi possível atualizar a cor: ${error.message}`};

    await refreshProductPaths(variant.product_id);
    return{status:"success",message:`Cor atualizada para “${color}”.`};
  }catch(error){
    return{status:"error",message:error instanceof Error?error.message:"Não foi possível atualizar a identificação da variante."};
  }
}
