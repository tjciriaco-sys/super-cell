import { describe, expect, it } from "vitest";
import { auditCatalogImages, type ImageAuditProduct } from "./catalog-image-audit";

const base: ImageAuditProduct = { id: "1", name: "Telefone", slug: "telefone", active: true, image_strategy: "variant", images: ["/products/telefone.webp"], product_variants: [] };

describe("auditoria de imagens do catálogo", () => {
  it("avisa quando cores diferentes dependem da imagem geral", () => {
    const issues = auditCatalogImages([{ ...base, product_variants: [{ active: true, color: "Azul", images: [] }, { active: true, color: "Preto", images: [] }] }]);
    expect(issues[0]?.reason).toBe("missing_variant_image");
  });

  it("avisa quando cores diferentes apontam para o mesmo arquivo", () => {
    const shared = ["/products/mesma.webp"];
    const issues = auditCatalogImages([{ ...base, product_variants: [{ active: true, color: "Azul", images: shared }, { active: true, color: "Preto", images: shared }] }]);
    expect(issues[0]?.reason).toBe("repeated_variant_image");
  });

  it("aceita foto coletiva quando essa estratégia é explícita", () => {
    const issues = auditCatalogImages([{ ...base, image_strategy: "group", product_variants: [{ active: true, color: "Azul", images: [] }, { active: true, color: "Preto", images: [] }] }]);
    expect(issues).toEqual([]);
  });

  it("aceita uma imagem própria para cada cor", () => {
    const issues = auditCatalogImages([{ ...base, product_variants: [{ active: true, color: "Azul", images: ["/products/azul.webp"] }, { active: true, color: "Preto", images: ["/products/preto.webp"] }] }]);
    expect(issues).toEqual([]);
  });
});
