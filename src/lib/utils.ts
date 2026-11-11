import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function variantLabel(v: { ram_gb?: number | null; storage_gb?: number | null; color?: string | null; specifications?: Record<string, Record<string, string>> }) {
  const memory = [commercialRamGb(v) ? `${commercialRamGb(v)} GB RAM` : null, v.storage_gb ? `${v.storage_gb} GB` : null].filter(Boolean).join(" · ");
  return [memory, v.color].filter(Boolean).join(" · ");
}

export function productDisplayName(product: { product_name: string; condition: string; battery_health_minimum?: number | null }) {
  if (product.condition !== "seminovo" || product.battery_health_minimum === null || product.battery_health_minimum === undefined) return product.product_name;
  return product.product_name.replace(/Bateria\s+\d+%/i, `🔋 ${product.battery_health_minimum}%`);
}

// A verified commercial RAM total can be limited to one storage configuration.
export function advertisedRam(variant: { ram_gb?: number | null; storage_gb?: number | null; specifications?: Record<string, Record<string, string>> }): {total:number;physical:number;virtual:number}|null {
  const metadata=variant.specifications?.["Memória anunciada"];
  if(!metadata||typeof metadata!=="object")return null;
  const physical=Number(metadata["RAM física (GB)"]);
  const virtual=Number(metadata["Expansão virtual (GB)"]);
  const total=Number(metadata["RAM anunciada (GB)"]);
  const storage=metadata["Armazenamento (GB)"];
  if(storage!==undefined&&Number(storage)!==variant.storage_gb)return null;
  if(!Number.isInteger(physical)||!Number.isInteger(virtual)||!Number.isInteger(total)||virtual<=0||physical<=0||total!==physical+virtual||variant.ram_gb!==physical)return null;
  return {total,physical,virtual};
}
export function commercialRamGb(variant: Parameters<typeof advertisedRam>[0]) {
  return advertisedRam(variant)?.total??variant.ram_gb;
}
