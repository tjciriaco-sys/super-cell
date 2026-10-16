import { describe, it, expect } from "vitest";
import { hashPersonalizedToken, derivePersonalizedToken } from "@/lib/personalized-catalog-link";
describe("DataCrazy route prerequisites", () => {
  it("requires robust token inputs", () => {
    const token = derivePersonalizedToken("lab_123", "local-only-secret-with-more-than-32-characters");
    expect(hashPersonalizedToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });
});
