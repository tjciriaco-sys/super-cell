"use client";

import { useEffect, useState } from "react";

type Filter="all"|"available"|"restocking";

export function AdminVariantFilter({
  counts,
}:{
  counts:{all:number;available:number;restocking:number};
}){
  const [filter,setFilter]=useState<Filter>("all");

  useEffect(()=>{
    document.querySelectorAll<HTMLElement>("[data-admin-variant-card]").forEach((card)=>{
      const status=card.dataset.status;
      card.hidden=filter!=="all"&&status!==filter;
    });
  },[filter]);

  return <div className="variant-filter-pills" role="group" aria-label="Filtrar variantes">
    <button type="button" className={filter==="all"?"active":""} onClick={()=>setFilter("all")}>Todas {counts.all}</button>
    <button type="button" className={filter==="available"?"active":""} onClick={()=>setFilter("available")}>Disponíveis {counts.available}</button>
    <button type="button" className={filter==="restocking"?"active":""} onClick={()=>setFilter("restocking")}>Reposição {counts.restocking}</button>
  </div>;
}
