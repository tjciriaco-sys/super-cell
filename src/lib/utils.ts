import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
export function variantLabel(v: { ram_gb?: number | null; storage_gb?: number | null; color?: string | null }) {
  const memory = [v.ram_gb ? `${v.ram_gb} GB RAM` : null, v.storage_gb ? `${v.storage_gb} GB` : null].filter(Boolean).join(" · ");
  return [memory, v.color].filter(Boolean).join(" · ");
}

export function productDisplayName(product: { product_name: string; condition: string; battery_health_minimum?: number | null }) {
  if (product.condition !== "seminovo" || product.battery_health_minimum === null || product.battery_health_minimum === undefined) return product.product_name;
  return product.product_name.replace(/Bateria\s+\d+%/i, `🔋 ${product.battery_health_minimum}%`);
}
