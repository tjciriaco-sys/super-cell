"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { productImageExtension, validateProductImage } from "@/lib/product-image-upload";

export type ProductCreateState = {
  status: "idle" | "error";
  message: string;
};

async function assertAdmin() {
  const supabase = await createClient();
  const { data: claimData } = await supabase.auth.getClaims();
  const claims = claimData?.claims;
  if (!claims?.sub) throw new Error("Sessão expirada. Entre novamente no painel.");
  const { data } = await supabase.from("admin_profiles").select("role").eq("user_id", claims.sub).eq("active", true).single();
  if (!data) throw new Error("Acesso não autorizado.");
  return supabase;
}

function slugify(value: string) {
  return value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function optionalInteger(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  if (!Number.isInteger(number) || number < 0) throw new Error(`${label} deve ser um número inteiro válido.`);
  return number;
}

function optionalPositiveNumber(value: FormDataEntryValue | null, label: string) {
  const text = String(value ?? "").trim().replace(",", ".");
  if (!text) return null;
  const number = Number(text);
  if (!Number.isFinite(number) || number <= 0) throw new Error(`${label} deve ser maior que zero.`);
  return number;
}

export async function createProductFromWizard(
  _previousState: ProductCreateState,
  formData: FormData,
): Promise<ProductCreateState> {
  const supabase = await assertAdmin();
  let createdProductId: string | null = null;

  try {
    const brandId = z.string().uuid().parse(formData.get("brand_id"));
    const categoryId = z.string().uuid().parse(formData.get("category_id"));
    const supplierId = z.string().uuid().parse(formData.get("supplier_id"));
    const model = z.string().trim().min(2, "Informe o modelo.").max(120).parse(formData.get("model"));
    const condition = z.enum(["novo", "seminovo"]).parse(formData.get("condition"));
    const connectivityInput = String(formData.get("connectivity") ?? "").trim();
    const connectivity = connectivityInput ? z.enum(["4G", "5G"]).parse(connectivityInput) : null;
    const description = String(formData.get("description") ?? "").trim() || null;
    const commercialStatus = z.enum(["available", "coming_soon", "restocking"]).parse(formData.get("commercial_status"));

    const ramGb = optionalInteger(formData.get("ram_gb"), "RAM");
    const storageGb = optionalInteger(formData.get("storage_gb"), "Armazenamento");
    const color = String(formData.get("color") ?? "").trim() || null;
    const colorHexInput = String(formData.get("color_hex") ?? "").trim();
    const colorHex = colorHexInput ? z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor visual inválida.").parse(colorHexInput) : null;
    const simConfiguration = String(formData.get("sim_configuration") ?? "").trim() || null;
    const skuInput = String(formData.get("sku") ?? "").trim();
    const sku = skuInput || `ADM-${randomUUID().slice(0, 8).toUpperCase()}`;

    const cost = optionalPositiveNumber(formData.get("cost"), "Custo");
    if (cost === null) throw new Error("Informe o custo do fornecedor.");
    const externalCode = String(formData.get("external_code") ?? "").trim() || null;
    const manualPrice = optionalPositiveNumber(formData.get("manual_price"), "Preço Pix manual");

    const batteryHealth = condition === "seminovo" ? optionalInteger(formData.get("battery_health_minimum"), "Saúde da bateria") : null;
    if (batteryHealth !== null && (batteryHealth < 1 || batteryHealth > 100)) throw new Error("Saúde da bateria deve ficar entre 1% e 100%.");
    const conditionGrade = condition === "seminovo" ? z.enum(["bom", "muito_bom", "excelente"]).parse(formData.get("condition_grade")) : null;
    const originalComponents = condition === "seminovo" ? String(formData.get("original_components") ?? "true") === "true" : null;
    const neverOpened = condition === "seminovo" ? String(formData.get("never_opened") ?? "true") === "true" : null;
    const warrantyMonths = condition === "seminovo" ? optionalInteger(formData.get("warranty_months"), "Garantia") ?? 3 : null;
    if (warrantyMonths !== null && warrantyMonths > 60) throw new Error("Garantia deve ficar entre 0 e 60 meses.");
    const conditionDetails = condition === "seminovo" ? String(formData.get("condition_details") ?? "").trim() || null : null;

    const highlights: Record<string, string> = {};
    if (storageGb) highlights.Armazenamento = `${storageGb} GB`;
    if (ramGb) highlights.RAM = `${ramGb} GB`;
    if (color) highlights.Cor = color;
    if (batteryHealth) highlights.Bateria = `${batteryHealth}%`;

    const name = condition === "seminovo" && batteryHealth ? `${model} · Bateria ${batteryHealth}%` : model;
    const slug = `${slugify(model)}-${condition}-${randomUUID().slice(0, 8)}`;
    const now = new Date().toISOString();

    const { data: product, error: productError } = await supabase.from("products").insert({
      brand_id: brandId,
      category_id: categoryId,
      name,
      slug,
      model,
      connectivity,
      condition,
      description,
      highlights,
      specifications: {},
      images: [],
      badges: condition === "seminovo" ? ["Seminovo"] : [],
      battery_minimum: null,
      sim_configuration: simConfiguration,
      active: true,
      featured: false,
      image_strategy: "variant",
      catalog_status: "draft",
      commercial_status: commercialStatus,
      updated_at: now,
    }).select("id,slug").single();

    if (productError || !product) throw new Error(`Não foi possível criar o produto: ${productError?.message ?? "erro desconhecido"}`);
    createdProductId = product.id;

    const { data: variant, error: variantError } = await supabase.from("product_variants").insert({
      product_id: product.id,
      sku,
      ram_gb: ramGb,
      storage_gb: storageGb,
      color,
      color_hex: colorHex,
      sim_configuration: simConfiguration,
      active: true,
      source_mode: "automatic",
      manual_price: manualPrice,
      manual_price_reason: manualPrice ? "Cadastro manual" : null,
      manual_price_started_at: manualPrice ? now : null,
      condition_grade: conditionGrade,
      battery_health_minimum: batteryHealth,
      original_components: originalComponents,
      never_opened: neverOpened,
      warranty_months: warrantyMonths,
      condition_details: conditionDetails,
      images: [],
      updated_at: now,
    }).select("id").single();

    if (variantError || !variant) throw new Error(`Não foi possível criar a variante: ${variantError?.message ?? "erro desconhecido"}`);

    const { error: offerError } = await supabase.from("supplier_offers").insert({
      supplier_id: supplierId,
      variant_id: variant.id,
      external_code: externalCode,
      source_label: "Cadastro manual do gestor",
      cost,
      available: commercialStatus === "available",
      source_updated_at: now,
      raw_data: { origin: "admin_manual" },
      updated_at: now,
    });

    if (offerError) throw new Error(`Não foi possível criar a oferta do fornecedor: ${offerError.message}`);

    const file = formData.get("image_file");
    if (file instanceof File && file.size > 0) {
      const validationError = validateProductImage(file);
      if (validationError) throw new Error(validationError);
      const extension = productImageExtension(file.type);
      if (!extension) throw new Error("Formato de imagem inválido.");
      const path = `products/${slugify(model)}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("product-images").upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });
      if (uploadError) throw new Error(`Não foi possível enviar a imagem: ${uploadError.message}`);
      const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
      const imageUrl = publicUrl.publicUrl;
      const { error: imageError } = await supabase.from("product_variants").update({ images: [imageUrl], updated_at: now }).eq("id", variant.id);
      if (imageError) throw new Error("A imagem foi enviada, mas não pôde ser vinculada ao produto.");
      const { error: coverError } = await supabase.from("products").update({ storefront_image: imageUrl, updated_at: now }).eq("id", product.id);
      if (coverError) throw new Error("A imagem foi salva, mas a capa da vitrine não pôde ser definida.");
    }

    revalidatePath("/admin/produtos");
    revalidatePath("/admin");
    revalidatePath("/", "layout");
  } catch (error) {
    if (createdProductId) await supabase.from("products").delete().eq("id", createdProductId);
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Revise os campos informados." : error instanceof Error ? error.message : "Não foi possível cadastrar o produto.";
    return { status: "error", message };
  }

  redirect(`/admin/produtos/${createdProductId}?created=1`);
}
