"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { productImageExtension, validateProductImage } from "@/lib/product-image-upload";

async function assertAdmin(){const supabase=await createClient();const {data:claimData}=await supabase.auth.getClaims();const claims=claimData?.claims;if(!claims?.sub)throw new Error("Sessão expirada.");const {data}=await supabase.from("admin_profiles").select("role").eq("user_id",claims.sub).eq("active",true).single();if(!data)throw new Error("Acesso não autorizado.");return supabase;}
export async function login(formData:FormData){const email=z.string().email().parse(formData.get("email"));const password=z.string().min(8).parse(formData.get("password"));const supabase=await createClient();const {error}=await supabase.auth.signInWithPassword({email,password});if(error)redirect(`/admin/login?error=${encodeURIComponent("E-mail ou senha inválidos.")}`);redirect("/admin")}
export async function activateOwner(formData:FormData){const name=z.string().min(2).parse(formData.get("name"));const email=z.string().email().parse(formData.get("email"));const password=z.string().min(8).parse(formData.get("password"));const token=z.string().min(20).parse(formData.get("token"));const supabase=await createClient();let {error}=await supabase.auth.signInWithPassword({email,password});if(error){const signup=await supabase.auth.signUp({email,password,options:{data:{full_name:name},emailRedirectTo:`${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/admin/ativar`}});error=signup.error;if(error)redirect(`/admin/ativar?error=${encodeURIComponent(error.message)}`);if(!signup.data.session)redirect('/admin/ativar?confirm=1');}const {error:claimError}=await supabase.rpc('claim_first_admin',{setup_token:token,owner_name:name});if(claimError)redirect(`/admin/ativar?error=${encodeURIComponent('Token inválido, já utilizado ou conta ainda não confirmada.')}`);redirect('/admin')}
export async function logout(){const supabase=await createClient();await supabase.auth.signOut();redirect("/admin/login")}
export async function toggleProduct(formData:FormData){const supabase=await assertAdmin();const id=z.string().uuid().parse(formData.get("id"));const active=formData.get("active")==="true";const {error}=await supabase.from("products").update({active:!active,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;revalidatePath("/admin/produtos");revalidatePath("/", "layout")}
export async function saveManualPrice(formData:FormData){const supabase=await assertAdmin();const variantId=z.string().uuid().parse(formData.get("variant_id"));const mode=z.enum(["automatic","manual"]).parse(formData.get("mode"));const price=mode==="manual"?z.coerce.number().positive().parse(formData.get("manual_price")):null;const reason=String(formData.get("reason")||"").trim()||null;const update:Record<string,unknown>={manual_price:price,manual_price_reason:reason,manual_price_started_at:price?new Date().toISOString():null,updated_at:new Date().toISOString()};if(formData.has("color"))update.color=z.string().trim().min(2).max(50).parse(formData.get("color"));if(formData.has("image_url")){const url=z.string().trim().max(500).parse(formData.get("image_url")??"");update.images=url?[url]:[];}if(formData.has("color_hex")){const value=String(formData.get("color_hex")||"").trim();update.color_hex=value?z.string().regex(/^#[0-9A-Fa-f]{6}$/).parse(value):null;}if(formData.has("condition_grade")){update.condition_grade=z.enum(["bom","muito_bom","excelente"]).parse(formData.get("condition_grade"));update.battery_health_minimum=z.coerce.number().int().min(1).max(100).parse(formData.get("battery_health_minimum"));update.original_components=z.enum(["true","false"]).parse(formData.get("original_components"))==="true";update.never_opened=z.enum(["true","false"]).parse(formData.get("never_opened"))==="true";update.warranty_months=z.coerce.number().int().min(0).max(60).parse(formData.get("warranty_months"));update.condition_details=z.string().trim().max(500).parse(formData.get("condition_details")??"")||null;}const {error}=await supabase.from("product_variants").update(update).eq("id",variantId);if(error)throw error;revalidatePath("/admin/produtos");revalidatePath("/", "layout")}
export async function createVariantForProduct(formData:FormData){
  const supabase=await assertAdmin();
  const productId=z.string().uuid().parse(formData.get("product_id"));
  const supplierId=z.string().uuid().parse(formData.get("supplier_id"));
  const color=z.string().trim().min(2,"Informe a cor.").max(50).parse(formData.get("color"));
  const colorHex=z.string().regex(/^#[0-9A-Fa-f]{6}$/,"Cor visual inválida.").parse(formData.get("color_hex"));
  const ramText=String(formData.get("ram_gb")??"").trim();
  const storageText=String(formData.get("storage_gb")??"").trim();
  const ramGb=ramText?z.coerce.number().int().min(0).parse(ramText):null;
  const storageGb=storageText?z.coerce.number().int().min(0).parse(storageText):null;
  const cost=z.coerce.number().positive("Informe um custo válido.").parse(String(formData.get("cost")??"").replace(",","."));
  const externalCode=String(formData.get("external_code")??"").trim()||null;
  const now=new Date().toISOString();

  const {data:product,error:productError}=await supabase.from("products").select("id,slug,commercial_status").eq("id",productId).single();
  if(productError||!product)throw new Error("Produto não encontrado.");

  let duplicateQuery=supabase.from("product_variants").select("id").eq("product_id",productId).eq("color",color);
  duplicateQuery=ramGb===null?duplicateQuery.is("ram_gb",null):duplicateQuery.eq("ram_gb",ramGb);
  duplicateQuery=storageGb===null?duplicateQuery.is("storage_gb",null):duplicateQuery.eq("storage_gb",storageGb);
  const {data:duplicate}=await duplicateQuery.maybeSingle();
  if(duplicate)throw new Error("Já existe uma variante com esta cor e configuração.");

  const {data:variant,error:variantError}=await supabase.from("product_variants").insert({
    product_id:productId,
    sku:`ADM-VAR-${randomUUID().slice(0,8).toUpperCase()}`,
    ram_gb:ramGb,
    storage_gb:storageGb,
    color,
    color_hex:colorHex,
    images:[],
    active:false,
    source_mode:"manual",
    updated_at:now,
  }).select("id").single();
  if(variantError||!variant)throw new Error(`Não foi possível criar a variante: ${variantError?.message??"erro desconhecido"}`);

  const {error:offerError}=await supabase.from("supplier_offers").insert({
    supplier_id:supplierId,
    variant_id:variant.id,
    external_code:externalCode,
    source_label:"Cadastro manual do gestor",
    cost,
    available:true,
    source_updated_at:now,
    raw_data:{origin:"admin_manual_variant"},
    updated_at:now,
  });
  if(offerError){
    await supabase.from("product_variants").delete().eq("id",variant.id);
    throw new Error(`Não foi possível criar a oferta da variante: ${offerError.message}`);
  }

  const {error:activateError}=await supabase.from("product_variants").update({active:true,updated_at:now}).eq("id",variant.id);
  if(activateError)throw new Error(`A variante foi criada, mas não pôde ser ativada: ${activateError.message}`);

  revalidatePath(`/admin/produtos/${productId}`);
  revalidatePath("/admin/produtos");
  revalidatePath(`/produto/${product.slug}`);
  revalidatePath("/", "layout");
}

export async function saveVariantImage(formData: FormData) {
  const supabase = await assertAdmin();
  const variantId = z.string().uuid().parse(formData.get("variant_id"));
  const file = formData.get("image_file");
  if (!(file instanceof File)) throw new Error("Selecione uma imagem para enviar.");
  const validationError = validateProductImage(file);
  if (validationError) throw new Error(validationError);
  const extension = productImageExtension(file.type);
  if (!extension) throw new Error("Formato de imagem inválido.");
  const { data: variant, error: variantError } = await supabase.from("product_variants").select("id,product_id,color,product:products(brand_id,category_id,model,condition,connectivity)").eq("id", variantId).single();
  if (variantError || !variant) throw new Error("Variante não encontrada.");
  const product = variant.product as unknown as { brand_id: string; category_id: string; model: string; condition: string; connectivity: string | null } | null;
  if (!product) throw new Error("Produto não encontrado.");
  const path = `products/${product.model.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}/${randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage.from("product-images").upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (uploadError) throw new Error("Não foi possível enviar a imagem.");
  const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
  const imageUrl = publicUrl.publicUrl;
  let targetIds = [variant.id];
  if (formData.get("apply_to_equivalent_variants") === "on" && variant.color) {
    let productsQuery = supabase.from("products").select("id").eq("brand_id", product.brand_id).eq("category_id", product.category_id).eq("model", product.model).eq("condition", product.condition);
    productsQuery = product.connectivity === null ? productsQuery.is("connectivity", null) : productsQuery.eq("connectivity", product.connectivity);
    const { data: equivalentProducts, error: productsError } = await productsQuery;
    if (productsError) throw new Error("Não foi possível localizar variantes equivalentes.");
    const productIds = (equivalentProducts ?? []).map((item) => item.id);
    if (productIds.length) {
      const { data: equivalents, error: equivalentsError } = await supabase.from("product_variants").select("id").in("product_id", productIds).eq("color", variant.color);
      if (equivalentsError) throw new Error("Não foi possível localizar variantes equivalentes.");
      targetIds = (equivalents ?? []).map((item) => item.id);
    }
  }
  const { error: updateError } = await supabase.from("product_variants").update({ images: [imageUrl], updated_at: new Date().toISOString() }).in("id", targetIds);
  if (updateError) throw new Error("A imagem foi enviada, mas não pôde ser vinculada à variante.");
  revalidatePath("/admin/produtos");
  revalidatePath("/", "layout");
}
export async function saveImageStrategy(formData:FormData){const supabase=await assertAdmin();const productId=z.string().uuid().parse(formData.get("product_id"));const imageStrategy=z.enum(["variant","group"]).parse(formData.get("image_strategy"));const update:Record<string,unknown>={image_strategy:imageStrategy,updated_at:new Date().toISOString()};if(formData.has("storefront_image"))update.storefront_image=z.string().trim().max(500).parse(formData.get("storefront_image")??"")||null;const {error}=await supabase.from("products").update(update).eq("id",productId);if(error)throw error;revalidatePath(`/admin/produtos/${productId}`);revalidatePath("/admin");revalidatePath("/", "layout")}
export async function saveCommercialStatus(formData:FormData){const supabase=await assertAdmin();const productId=z.string().uuid().parse(formData.get("product_id"));const commercialStatus=z.enum(["available","coming_soon","restocking"]).parse(formData.get("commercial_status"));const {error}=await supabase.from("products").update({commercial_status:commercialStatus,updated_at:new Date().toISOString()}).eq("id",productId);if(error)throw new Error(`Não foi possível alterar a situação comercial: ${error.message}`);revalidatePath(`/admin/produtos/${productId}`);revalidatePath("/admin/produtos");revalidatePath("/", "layout")}
export async function saveCatalogStatus(formData:FormData){const supabase=await assertAdmin();const productId=z.string().uuid().parse(formData.get("product_id"));const catalogStatus=z.enum(["draft","ready"]).parse(formData.get("catalog_status"));const {error}=await supabase.from("products").update({catalog_status:catalogStatus,updated_at:new Date().toISOString()}).eq("id",productId);if(error)throw new Error(`Não foi possível publicar: ${error.message}`);revalidatePath(`/admin/produtos/${productId}`);revalidatePath("/admin/produtos");revalidatePath("/admin");revalidatePath("/", "layout");}
export async function setCurrentAcquirer(formData:FormData){const supabase=await assertAdmin();const id=z.string().uuid().parse(formData.get("id"));const {error:first}=await supabase.from("payment_acquirers").update({is_current:false});if(first)throw first;const {error}=await supabase.from("payment_acquirers").update({is_current:true,updated_at:new Date().toISOString()}).eq("id",id);if(error)throw error;revalidatePath("/admin/pagamentos");revalidatePath("/", "layout")}
export async function updateCommercialSettings(formData:FormData){const supabase=await assertAdmin();const whatsapp=String(formData.get("whatsapp")||"").replace(/\D/g,"");const text=String(formData.get("cash_text")||"").trim();const instagramInput=String(formData.get("instagram")||"").trim();const instagram=instagramInput?(instagramInput.startsWith("http")?z.string().url().parse(instagramInput):`https://www.instagram.com/${instagramInput.replace(/^@/,"").replace(/\/$/,"")}/`):"";const cnpj=String(formData.get("cnpj")||"").trim();const cnpjDigits=cnpj.replace(/\D/g,"");const location=z.string().trim().min(2).max(100).parse(formData.get("location"));if(whatsapp.length<12)throw new Error("Informe o WhatsApp com DDI e DDD.");if(cnpjDigits&&cnpjDigits.length!==14)throw new Error("Informe um CNPJ válido com 14 dígitos.");const now=new Date().toISOString();const {error}=await supabase.from("commercial_settings").upsert([{key:"whatsapp_sales",value:whatsapp,public:true,description:"Número de vendas em formato internacional",updated_at:now},{key:"cash_on_delivery_text",value:text,public:true,description:"Texto comercial",updated_at:now},{key:"instagram_url",value:instagram,public:true,description:"Perfil oficial no Instagram",updated_at:now},{key:"company_cnpj",value:cnpj,public:true,description:"CNPJ exibido no rodapé",updated_at:now},{key:"company_location",value:location,public:true,description:"Localização pública da empresa",updated_at:now}]);if(error)throw error;revalidatePath("/admin/configuracoes");revalidatePath("/", "layout")}
