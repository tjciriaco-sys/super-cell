import { describe, expect, it } from "vitest";
import { PRODUCT_IMAGE_MAX_BYTES, productImageExtension, validateProductImage } from "./product-image-upload";

describe("validação de upload de imagem", () => {
  it("aceita JPEG, PNG e WebP até 5 MB", () => {
    expect(validateProductImage({ type: "image/webp", size: PRODUCT_IMAGE_MAX_BYTES, name: "iphone.webp" })).toBeNull();
  });

  it("rejeita formatos e tamanhos inválidos", () => {
    expect(validateProductImage({ type: "application/pdf", size: 100, name: "arquivo.pdf" })).toBeTruthy();
    expect(validateProductImage({ type: "image/jpeg", size: PRODUCT_IMAGE_MAX_BYTES + 1, name: "grande.jpg" })).toBeTruthy();
  });

  it("deriva extensões seguras", () => {
    expect(productImageExtension("image/png")).toBe("png");
    expect(productImageExtension("image/gif")).toBeNull();
  });
});
