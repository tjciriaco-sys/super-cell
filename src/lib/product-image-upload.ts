export const PRODUCT_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const PRODUCT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const extensions: Record<(typeof PRODUCT_IMAGE_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateProductImage(file: { type: string; size: number; name: string }) {
  if (!PRODUCT_IMAGE_MIME_TYPES.includes(file.type as (typeof PRODUCT_IMAGE_MIME_TYPES)[number])) return "Envie uma imagem JPEG, PNG ou WebP.";
  if (file.size <= 0) return "Selecione uma imagem válida.";
  if (file.size > PRODUCT_IMAGE_MAX_BYTES) return "A imagem deve ter no máximo 5 MB.";
  return null;
}

export function productImageExtension(mimeType: string) {
  return extensions[mimeType as keyof typeof extensions] ?? null;
}
