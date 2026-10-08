"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";

type Group="all"|"iphone"|"android"|"other";

function normalize(value:string){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("pt-BR").trim();
}

export function AdminProductSearch(){
  const [query,setQuery]=useState("");
  const [group,setGroup]=useState<Group>("all");

  useEffect(()=>{
    const needle=normalize(query);
    document.querySelectorAll<HTMLTableRowElement>("[data-admin-product-row]").forEach((row)=>{
      const haystack=row.dataset.search??"";
      const rowGroup=(row.dataset.group??"other") as Group;
      const matchesQuery=!needle||haystack.includes(needle);
      const matchesGroup=group==="all"||rowGroup===group;
      row.hidden=!(matchesQuery&&matchesGroup);
    });
  },[query,group]);

  return <div className="admin-product-tools">
    <div className="admin-search">
      <Search/>
      <input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Buscar produto, SKU ou variante" aria-label="Buscar produtos" autoComplete="off"/>
    </div>
    <div className="admin-product-group-filter" role="group" aria-label="Filtrar produtos por categoria">
      <button type="button" className={group==="all"?"active":""} onClick={()=>setGroup("all")}>Todos</button>
      <button type="button" className={group==="iphone"?"active":""} onClick={()=>setGroup("iphone")}>iPhones</button>
      <button type="button" className={group==="android"?"active":""} onClick={()=>setGroup("android")}>Androids</button>
      <button type="button" className={group==="other"?"active":""} onClick={()=>setGroup("other")}>Outros</button>
    </div>
  </div>;
}
