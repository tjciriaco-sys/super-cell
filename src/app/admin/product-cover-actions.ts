"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { productImageExtension, validateProductImage } from "@/lib/product-image-upload";

export type StorefrontCoverActionState = {
  status: "success" | "error";
  message: string;
  url?: string;
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

export async function saveGeneratedStorefrontCover(formData: FormData): Promise<StorefrontCoverActionState> {
  try {
    const supabase = await assertAdmin();
    const productId = z.string().uuid().parse(formData.get("product_id"));
    const file = formData.get("cover_file");

    if (!(file instanceof File) || file.size === 0) {
      return { status: "error", message: "Não foi possível gerar o arquivo da capa." };
    }

    const validationError = validateProductImage(file);
    if (validationError) return { status: "error", message: validationError };

    const extension = productImageExtension(file.type);
    if (!extension) return { status: "error", message: "Formato de capa inválido." };

    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id,slug,model")
      .eq("id", productId)
      .single();

    if (productError || !product) return { status: "error", message: "Produto não encontrado." };

    const path = `covers-v6/${slugify(product.model || product.slug)}/${randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, await file.arrayBuffer(), { contentType: file.type, cacheControl: "31536000", upsert: false });

    if (uploadError) return { status: "error", message: `Não foi possível enviar a capa: ${uploadError.message}` };

    const { data: publicUrl } = supabase.storage.from("product-images").getPublicUrl(path);
    const coverUrl = publicUrl.publicUrl;

    const { error: updateError } = await supabase
      .from("products")
      .update({ storefront_image: coverUrl, image_strategy: "variant", updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (updateError) return { status: "error", message: `A capa foi enviada, mas não pôde ser vinculada ao produto: ${updateError.message}` };

    revalidatePath(`/admin/produtos/${productId}`);
    revalidatePath(`/produto/${product.slug}`);
    revalidatePath("/", "layout");

    return { status: "success", message: "Capa da vitrine gerada e publicada com sucesso.", url: coverUrl };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Não foi possível gerar a capa da vitrine." };
  }
}
