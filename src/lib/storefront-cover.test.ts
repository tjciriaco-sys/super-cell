import { describe, expect, it } from "vitest";
import { storefrontCoverNeedsGeneration, storefrontCoverSources } from "./storefront-cover";

describe("storefront cover helpers", () => {
  it("keeps one image per color and removes duplicate image URLs", () => {
    expect(storefrontCoverSources([
      { color: "Preto", image: "preto.webp" },
      { color: "Preto", image: "preto-duplicado.webp" },
      { color: "Azul", image: "azul.webp" },
      { color: "Verde", image: "azul.webp" },
    ])).toEqual([
      { color: "Preto", image: "preto.webp" },
      { color: "Azul", image: "azul.webp" },
    ]);
  });

  it("asks for a cover when multiple colors exist and the cover is missing", () => {
    expect(storefrontCoverNeedsGeneration(null, [
      { color: "Preto", image: "preto.webp" },
      { color: "Azul", image: "azul.webp" },
    ])).toBe(true);
  });

  it("asks for a cover when the storefront is still using one variant image", () => {
    expect(storefrontCoverNeedsGeneration("preto.webp", [
      { color: "Preto", image: "preto.webp" },
      { color: "Azul", image: "azul.webp" },
      { color: "Verde", image: "verde.webp" },
    ])).toBe(true);
  });

  it("asks to replace an old generated cover with the layered v7 format", () => {
    expect(storefrontCoverNeedsGeneration("https://example.com/covers/model/old.webp", [
      { color: "Preto", image: "preto.webp" },
      { color: "Azul", image: "azul.webp" },
    ])).toBe(true);
  });

  it("keeps a layered v7 cover", () => {
    expect(storefrontCoverNeedsGeneration("https://example.com/covers-v7/model/new.webp", [
      { color: "Preto", image: "preto.webp" },
      { color: "Azul", image: "azul.webp" },
    ])).toBe(false);
  });
});
