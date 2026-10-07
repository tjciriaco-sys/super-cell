"use client";

import { useRouter } from "next/navigation";

type PricingCategory = { slug:string; name:string };

export function PricingCategorySelector({categories,selected}:{categories:PricingCategory[];selected:string}){
  const router=useRouter();
  return <label className="pricing-category-select">
    <span>Categoria</span>
    <select value={selected} onChange={(event)=>router.push(`/admin/precificacao?categoria=${encodeURIComponent(event.target.value)}`)}>
      {categories.map((category)=><option key={category.slug} value={category.slug}>{category.name}</option>)}
    </select>
  </label>;
}
