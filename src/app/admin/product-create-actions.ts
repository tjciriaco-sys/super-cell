"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { productImageExtension, validateProductImage } from "@/lib/product-image-upload";

export type ProductCreateState={status:"idle"|"error";message:string};

async function assertAdmin(){
  const supabase=await createClient();
  const {data:claimData}=await supabase.auth.getClaims();
  const claims=claimData?.claims;
  if(!claims?.sub)throw new Error("Sessão expirada. Entre novamente no painel.");
  const {data}=await supabase.from("admin_profiles").select("role").eq("user_id",claims.sub).eq("active",true).single();
  if(!data)throw new Error("Acesso não autorizado.");
  return supabase;
}

function slugify(value:string){
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
}
function text(value:FormDataEntryValue|null){return String(value??"").trim()}
function optionalInteger(value:FormDataEntryValue|null,label:string){
  const raw=text(value); if(!raw)return null;
  const number=Number(raw); if(!Number.isInteger(number)||number<0)throw new Error(`${label} deve ser um número inteiro válido.`);
  return number;
}
function optionalPositiveNumber(value:FormDataEntryValue|null,label:string){
  const raw=text(value).replace(",","."); if(!raw)return null;
  const number=Number(raw); if(!Number.isFinite(number)||number<=0)throw new Error(`${label} deve ser maior que zero.`);
  return number;
}
function variantStatus(value:FormDataEntryValue|null){
  const raw=text(value)||"available";
  return z.enum(["available","restocking","hidden"]).parse(raw);
}
function boolValue(value:FormDataEntryValue|null,fallback=true){
  const raw=text(value); if(!raw)return fallback; return raw==="true";
}

async function uploadVariantImage({
  supabase,file,variantId,model,productId,setCover=false,
}:{
  supabase:Awaited<ReturnType<typeof createClient>>;
  file:FormDataEntryValue|null;
  variantId:string;
  model:string;
  productId:string;
  setCover?:boolean;
}){
  if(!(file instanceof File)||file.size===0)return;
  const validationError=validateProductImage(file); if(validationError)throw new Error(validationError);
  const extension=productImageExtension(file.type); if(!extension)throw new Error("Formato de imagem inválido.");
  const path=`products/${slugify(model)}/${randomUUID()}.${extension}`;
  const {error:uploadError}=await supabase.storage.from("product-images").upload(path,await file.arrayBuffer(),{contentType:file.type,cacheControl:"31536000",upsert:false});
  if(uploadError)throw new Error(`Não foi possível enviar a imagem: ${uploadError.message}`);
  const {data:publicUrl}=supabase.storage.from("product-images").getPublicUrl(path);
  const imageUrl=publicUrl.publicUrl;
  const {error:imageError}=await supabase.from("product_variants").update({images:[imageUrl],updated_at:new Date().toISOString()}).eq("id",variantId);
  if(imageError)throw new Error("A imagem foi enviada, mas não pôde ser vinculada à variante.");
  if(setCover){
    const {error:coverError}=await supabase.from("products").update({storefront_image:imageUrl,updated_at:new Date().toISOString()}).eq("id",productId);
    if(coverError)throw new Error("A imagem foi salva, mas a capa da vitrine não pôde ser definida.");
  }
}

function parseVariant(formData:FormData,condition:"novo"|"seminovo"){
  const ramGb=optionalInteger(formData.get("ram_gb"),"RAM");
  const storageGb=optionalInteger(formData.get("storage_gb"),"Armazenamento");
  const color=text(formData.get("color"))||null;
  const colorHexRaw=text(formData.get("color_hex"));
  const colorHex=colorHexRaw?z.string().regex(/^#[0-9A-Fa-f]{6}$/,"Cor visual inválida.").parse(colorHexRaw):null;
  const simConfiguration=text(formData.get("sim_configuration"))||null;
  const sku=text(formData.get("sku"))||`ADM-${randomUUID().slice(0,8).toUpperCase()}`;
  const manualPrice=optionalPositiveNumber(formData.get("manual_price"),"Preço Pix manual");
  const status=variantStatus(formData.get("commercial_status"));
  const batteryHealth=condition==="seminovo"?optionalInteger(formData.get("battery_health_minimum"),"Saúde da bateria"):null;
  if(batteryHealth!==null&&(batteryHealth<1||batteryHealth>100))throw new Error("Saúde da bateria deve ficar entre 1% e 100%.");
  const conditionGrade=condition==="seminovo"?z.enum(["bom","muito_bom","excelente"]).parse(text(formData.get("condition_grade"))||"excelente"):null;
  const originalComponents=condition==="seminovo"?boolValue(formData.get("original_components"),true):null;
  const neverOpened=condition==="seminovo"?boolValue(formData.get("never_opened"),true):null;
  const warrantyMonths=condition==="seminovo"?(optionalInteger(formData.get("warranty_months"),"Garantia")??3):null;
  if(warrantyMonths!==null&&warrantyMonths>60)throw new Error("Garantia deve ficar entre 0 e 60 meses.");
  const conditionDetails=condition==="seminovo"?(text(formData.get("condition_details"))||null):null;
  return {ramGb,storageGb,color,colorHex,simConfiguration,sku,manualPrice,status,batteryHealth,conditionGrade,originalComponents,neverOpened,warrantyMonths,conditionDetails};
}

async function createOffer(supabase:Awaited<ReturnType<typeof createClient>>,formData:FormData,variantId:string,status:"available"|"restocking"|"hidden"){
  const supplierId=z.string().uuid("Selecione o fornecedor.").parse(text(formData.get("supplier_id")));
  const cost=optionalPositiveNumber(formData.get("cost"),"Custo");
  if(cost===null)throw new Error("Informe o custo do fornecedor.");
  const externalCode=text(formData.get("external_code"))||null;
  const now=new Date().toISOString();
  const {error}=await supabase.from("supplier_offers").insert({
    supplier_id:supplierId,variant_id:variantId,external_code:externalCode,source_label:"Cadastro manual do gestor",
    cost,available:status==="available",source_updated_at:now,raw_data:{origin:"admin_manual"},updated_at:now,
  });
  if(error)throw new Error(`Não foi possível criar a oferta do fornecedor: ${error.message}`);
}

export async function createProductFromWizard(_previousState:ProductCreateState,formData:FormData):Promise<ProductCreateState>{
  const supabase=await assertAdmin();
  let createdProductId:string|null=null;
  try{
    const brandId=z.string().uuid("Selecione a marca.").parse(text(formData.get("brand_id")));
    const categoryId=z.string().uuid("Selecione a categoria.").parse(text(formData.get("category_id")));
    const model=z.string().trim().min(2,"Informe o modelo.").max(120).parse(text(formData.get("model")));
    const condition=z.enum(["novo","seminovo"]).parse(text(formData.get("condition"))||"novo");
    const connectivityRaw=text(formData.get("connectivity"));
    const connectivity=connectivityRaw?z.enum(["4G","5G"]).parse(connectivityRaw):null;
    const description=text(formData.get("description"))||null;
    const variant=parseVariant(formData,condition);
    const now=new Date().toISOString();
    const highlights:Record<string,string>={};
    if(variant.storageGb)highlights.Armazenamento=`${variant.storageGb} GB`;
    if(variant.ramGb)highlights.RAM=`${variant.ramGb} GB`;
    if(variant.color)highlights.Cor=variant.color;
    if(variant.batteryHealth)highlights.Bateria=`${variant.batteryHealth}%`;
    const name=condition==="seminovo"&&variant.batteryHealth?`${model} · Bateria ${variant.batteryHealth}%`:model;
    const slug=`${slugify(model)}-${condition}-${randomUUID().slice(0,8)}`;

    const {data:product,error:productError}=await supabase.from("products").insert({
      brand_id:brandId,category_id:categoryId,name,slug,model,connectivity,condition,description,highlights,
      specifications:{},images:[],badges:condition==="seminovo"?["Seminovo"]:[],battery_minimum:null,
      sim_configuration:variant.simConfiguration,active:true,featured:false,image_strategy:"variant",
      catalog_status:"draft",commercial_status:"coming_soon",updated_at:now,
    }).select("id,slug").single();
    if(productError||!product)throw new Error(`Não foi possível criar o produto: ${productError?.message??"erro desconhecido"}`);
    createdProductId=product.id;

    const {data:createdVariant,error:variantError}=await supabase.from("product_variants").insert({
      product_id:product.id,sku:variant.sku,ram_gb:variant.ramGb,storage_gb:variant.storageGb,color:variant.color,color_hex:variant.colorHex,
      sim_configuration:variant.simConfiguration,active:true,source_mode:"automatic",manual_price:variant.manualPrice,
      manual_price_reason:variant.manualPrice?"Cadastro manual":null,manual_price_started_at:variant.manualPrice?now:null,
      condition_grade:variant.conditionGrade,battery_health_minimum:variant.batteryHealth,original_components:variant.originalComponents,
      never_opened:variant.neverOpened,warranty_months:variant.warrantyMonths,condition_details:variant.conditionDetails,
      commercial_status:variant.status,images:[],updated_at:now,
    }).select("id").single();
    if(variantError||!createdVariant)throw new Error(`Não foi possível criar a variante: ${variantError?.message??"erro desconhecido"}`);

    await createOffer(supabase,formData,createdVariant.id,variant.status);
    await uploadVariantImage({supabase,file:formData.get("image_file"),variantId:createdVariant.id,model,productId:product.id,setCover:true});

    revalidatePath("/admin/produtos");revalidatePath("/admin");revalidatePath("/","layout");
  }catch(error){
    if(createdProductId)await supabase.from("products").delete().eq("id",createdProductId);
    const message=error instanceof z.ZodError?error.issues[0]?.message??"Revise os campos informados.":error instanceof Error?error.message:"Não foi possível cadastrar o produto.";
    return{status:"error",message};
  }
  redirect(`/admin/produtos/${createdProductId}?created=1`);
}

export async function createVariantFromWizard(_previousState:ProductCreateState,formData:FormData):Promise<ProductCreateState>{
  const supabase=await assertAdmin();
  let createdVariantId:string|null=null;
  try{
    const productId=z.string().uuid().parse(text(formData.get("product_id")));
    const {data:product,error:productError}=await supabase.from("products").select("id,model,condition").eq("id",productId).single();
    if(productError||!product)throw new Error("Produto não encontrado.");
    const condition=z.enum(["novo","seminovo"]).parse(product.condition);
    const variant=parseVariant(formData,condition);
    const now=new Date().toISOString();

    const {data:createdVariant,error:variantError}=await supabase.from("product_variants").insert({
      product_id:product.id,sku:variant.sku,ram_gb:variant.ramGb,storage_gb:variant.storageGb,color:variant.color,color_hex:variant.colorHex,
      sim_configuration:variant.simConfiguration,active:true,source_mode:"automatic",manual_price:variant.manualPrice,
      manual_price_reason:variant.manualPrice?"Cadastro manual":null,manual_price_started_at:variant.manualPrice?now:null,
      condition_grade:variant.conditionGrade,battery_health_minimum:variant.batteryHealth,original_components:variant.originalComponents,
      never_opened:variant.neverOpened,warranty_months:variant.warrantyMonths,condition_details:variant.conditionDetails,
      commercial_status:variant.status,images:[],updated_at:now,
    }).select("id").single();
    if(variantError||!createdVariant)throw new Error(`Não foi possível criar a variante: ${variantError?.message??"erro desconhecido"}`);
    createdVariantId=createdVariant.id;

    await createOffer(supabase,formData,createdVariant.id,variant.status);
    await uploadVariantImage({supabase,file:formData.get("image_file"),variantId:createdVariant.id,model:product.model,productId:product.id,setCover:false});

    revalidatePath(`/admin/produtos/${product.id}`);revalidatePath("/admin/produtos");revalidatePath("/","layout");
  }catch(error){
    if(createdVariantId)await supabase.from("product_variants").delete().eq("id",createdVariantId);
    const message=error instanceof z.ZodError?error.issues[0]?.message??"Revise os campos informados.":error instanceof Error?error.message:"Não foi possível cadastrar a variante.";
    return{status:"error",message};
  }
  redirect(`/admin/produtos/${text(formData.get("product_id"))}?variant-created=1`);
}
