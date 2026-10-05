"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { productImageExtension, validateProductImage } from "@/lib/product-image-upload";

export type ProductImageActionState = {
  status: "idle" | "success" | "error";
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

export async function saveVariantImageWithFeedback(
  _previousState: ProductImageActionState,
  formData: FormData,
): Promise<ProductImageActionState> {
  try {
    const supabase = await assertAdmin();
    const variantId = z.string().uuid().parse(formData.get("variant_id"));
    const file = formData.get("image_file");

    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "Selecione uma imagem antes de salvar." };
    }

    const validationError = validateProductImage(file);
    if (validationError) return { status: "error", message: validationError };

    const extension = productImageExtension(file.type);
    if (!extension) return { status: "error", message: "Formato de imagem inválido." };

    const { data: variant, error: variantError } = await supabase
      .from("product_variants")
      .select("id,product_id,color,product:products(id,brand_id,category_id,model,condition,connectivity,image_strategy,slug)")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) return { status: "error", message: "Variante não encontrada." };

    const product = variant.product as unknown as {
      id: string;
      brand_id: string;
      category_id: string;
      model: string;
      condition: string;
      connectivity: string | null;
      image_strategy: string;
      slug: string;
    } | null;

    if (!product) return { status: "error", message: "Produto não encontrado." };

    const path = `products/${slugify(product.model)}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (uploadError) return { status: "error", message: `Não foi possível enviar a imagem: ${uploadError.message}` };

    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
    const imageUrl = publicUrl.publicUrl;

    let targetVariants: { id: string; product_id: string }[] = [{ id: variant.id, product_id: variant.product_id }];

    if (formData.get("apply_to_equivalent_variants") === "on" && variant.color) {
      let productsQuery = supabase
        .from("products")
        .select("id")
        .eq("brand_id", product.brand_id)
        .eq("category_id", product.category_id)
        .eq("model", product.model)
        .eq("condition", product.condition);

      productsQuery = product.connectivity === null
        ? productsQuery.is("connectivity", null)
        : productsQuery.eq("connectivity", product.connectivity);

      const { data: equivalentProducts, error: productsError } = await productsQuery;
      if (productsError) return { status: "error", message: "A imagem foi enviada, mas não foi possível localizar variantes equivalentes." };

      const productIds = (equivalentProducts ?? []).map((item) => item.id);
      if (productIds.length) {
        const { data: equivalents, error: equivalentsError } = await supabase
          .from("product_variants")
          .select("id,product_id")
          .in("product_id", productIds)
          .eq("color", variant.color);

        if (equivalentsError) return { status: "error", message: "A imagem foi enviada, mas não foi possível localizar variantes equivalentes." };
        if (equivalents?.length) targetVariants = equivalents;
      }
    }

    const targetIds = targetVariants.map((item) => item.id);
    const targetProductIds = Array.from(new Set(targetVariants.map((item) => item.product_id)));

    const { error: updateError } = await supabase
      .from("product_variants")
      .update({ images: [imageUrl], updated_at: new Date().toISOString() })
      .in("id", targetIds);

    if (updateError) return { status: "error", message: "A imagem foi enviada, mas não pôde ser vinculada à variante." };

    if (targetProductIds.length) {
      const { error: coverError } = await supabase
        .from("products")
        .update({ storefront_image: imageUrl, updated_at: new Date().toISOString() })
        .in("id", targetProductIds)
        .eq("image_strategy", "variant");

      if (coverError) return { status: "error", message: "A imagem foi salva, mas a capa da vitrine não pôde ser atualizada." };

      const { data: affectedProducts } = await supabase.from("products").select("slug").in("id", targetProductIds);
      for (const item of affectedProducts ?? []) revalidatePath(`/produto/${item.slug}`);
    }

    revalidatePath("/admin/produtos");
    revalidatePath("/", "layout");

    const count = targetIds.length;
    return {
      status: "success",
      message: count > 1 ? `Imagem salva e aplicada a ${count} variantes equivalentes.` : "Imagem salva e atualizada na vitrine.",
    };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível salvar a imagem." };
  }
}
