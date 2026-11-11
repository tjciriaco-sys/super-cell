import { describe, expect, it } from "vitest";
import { productDisplayName, commercialRamGb, advertisedRam, variantLabel } from "./utils";

describe("productDisplayName", () => {
  it("uses the compact battery label for used iPhones", () => {
    expect(productDisplayName({ product_name: "iPhone 13 Pro · Bateria 92%", condition: "seminovo", battery_health_minimum: 92 })).toBe("iPhone 13 Pro · 🔋 92%");
  });

  it("preserves names without a used-device battery presentation", () => {
    expect(productDisplayName({ product_name: "iPhone 15", condition: "novo", battery_health_minimum: null })).toBe("iPhone 15");
  });
});

describe("verified commercial RAM", () => {
  const specifications={"Memória anunciada":{"RAM física (GB)":"12","Expansão virtual (GB)":"12","RAM anunciada (GB)":"24","Armazenamento (GB)":"512"}};
  it("keeps 256 GB physical RAM while advertising the verified 512 GB expansion", () => {
    expect(commercialRamGb({ram_gb:12,storage_gb:256,specifications})).toBe(12);
    expect(commercialRamGb({ram_gb:12,storage_gb:512,specifications})).toBe(24);
    expect(variantLabel({ram_gb:12,storage_gb:512,specifications})).toBe("24 GB RAM · 512 GB");
  });
  it("rejects mismatched physical RAM and preserves existing expansion metadata", () => {
    expect(advertisedRam({ram_gb:8,storage_gb:512,specifications})).toBeNull();
    expect(commercialRamGb({ram_gb:8,specifications:{"Memória anunciada":{"RAM física (GB)":"8","Expansão virtual (GB)":"8","RAM anunciada (GB)":"16"}}})).toBe(16);
  });
});
