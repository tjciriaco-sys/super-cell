export type ImageAuditVariant = {
  active: boolean;
  color: string | null;
  images: unknown;
};

export type ImageAuditProduct = {
  id: string;
  name: string;
  slug: string;
  active: boolean;
  image_strategy: "variant" | "group";
  images: unknown;
  product_variants: ImageAuditVariant[];
};

export type ImageAuditIssue = {
  productId: string;
  productName: string;
  slug: string;
  reason: "missing_image" | "missing_variant_image" | "repeated_variant_image" | "missing_group_image";
  detail: string;
};

function imageList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0) : [];
}

export function auditCatalogImages(products: ImageAuditProduct[]): ImageAuditIssue[] {
  const issues: ImageAuditIssue[] = [];

  for (const product of products.filter((item) => item.active)) {
    const variants = product.product_variants.filter((item) => item.active);
    const productImages = imageList(product.images);
    const colors = new Set(variants.map((item) => item.color?.trim().toLocaleLowerCase("pt-BR")).filter(Boolean));

    if (variants.some((variant) => imageList(variant.images).length === 0 && productImages.length === 0)) {
      issues.push({ productId: product.id, productName: product.name, slug: product.slug, reason: "missing_image", detail: "Há variante ativa sem nenhuma imagem." });
      continue;
    }

    if (colors.size < 2) continue;

    if (product.image_strategy === "group") {
      if (productImages.length === 0) {
        issues.push({ productId: product.id, productName: product.name, slug: product.slug, reason: "missing_group_image", detail: "A foto coletiva foi escolhida, mas o produto não possui imagem geral." });
      }
      continue;
    }

    const withoutOwnImage = variants.filter((variant) => variant.color && imageList(variant.images).length === 0);
    if (withoutOwnImage.length > 0) {
      issues.push({ productId: product.id, productName: product.name, slug: product.slug, reason: "missing_variant_image", detail: `${withoutOwnImage.length} cor(es) ainda usam a imagem geral do produto.` });
      continue;
    }

    const signatures = variants.filter((variant) => variant.color).map((variant) => imageList(variant.images).join("|"));
    if (new Set(signatures).size < signatures.length) {
      issues.push({ productId: product.id, productName: product.name, slug: product.slug, reason: "repeated_variant_image", detail: "Cores diferentes estão vinculadas ao mesmo arquivo de imagem." });
    }
  }

  return issues;
}
