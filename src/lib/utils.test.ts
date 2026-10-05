import { describe, expect, it } from "vitest";
import { productDisplayName } from "./utils";

describe("productDisplayName", () => {
  it("uses the compact battery label for used iPhones", () => {
    expect(productDisplayName({ product_name: "iPhone 13 Pro · Bateria 92%", condition: "seminovo", battery_health_minimum: 92 })).toBe("iPhone 13 Pro · 🔋 92%");
  });

  it("preserves names without a used-device battery presentation", () => {
    expect(productDisplayName({ product_name: "iPhone 15", condition: "novo", battery_health_minimum: null })).toBe("iPhone 15");
  });
});
