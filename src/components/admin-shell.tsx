"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Boxes, Calculator, CreditCard, FileClock, Gauge, Heart, Import, LogOut, Menu, Route, Settings, Truck, X } from "lucide-react";
import { logout } from "@/app/admin/actions";

const items = [
  {href:"/admin",label:"Visão geral",Icon:Gauge},
  {href:"/admin/produtos",label:"Produtos",Icon:Boxes},
  {href:"/admin/interesses",label:"Interesses",Icon:Heart},
  {href:"/admin/fornecedores",label:"Fornecedores",Icon:Truck},
  {href:"/admin/precificacao",label:"Precificação",Icon:Calculator},
  {href:"/admin/pagamentos",label:"Pagamentos",Icon:CreditCard},
  {href:"/admin/logistica",label:"Logística",Icon:Route},
  {href:"/admin/importacoes",label:"Importações",Icon:Import},
  {href:"/admin/configuracoes",label:"Configurações",Icon:Settings},
  {href:"/admin/historico",label:"Histórico",Icon:FileClock},
] as const;
const primary = items.slice(0,4);
const secondary = items.slice(4);
export function AdminShell({children,user}:{children:React.ReactNode;user:string}) {
  const pathname = usePathname();
  const [moreOpen,setMoreOpen] = useState(false);
  useEffect(()=>{setMoreOpen(false);},[pathname]);
  useEffect(()=>{
    if (!moreOpen) return;
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setMoreOpen(false);};
    document.addEventListener("keydown",onKey);
    return ()=>document.removeEventListener("keydown",onKey);
  },[moreOpen]);
  const active=(href:string)=>href==="/admin"?pathname==="/admin":pathname.startsWith(href);
  const moreActive=secondary.some(({href})=>active(href));
  return <div className="admin-app admin-v2">
    <aside className="admin-sidebar">
      <Link className="brand admin-brand" href="/"><span><strong>SUPER</strong> CELL</span><small>Administração</small></Link>
      <nav aria-label="Navegação administrativa">{items.map(({href,label,Icon})=><Link href={href} key={href} aria-current={active(href)?"page":undefined} className={active(href)?"is-current":""}><Icon aria-hidden="true"/>{label}</Link>)}</nav>
      <div className="admin-user"><span>{user}</span><form action={logout}><button type="submit"><LogOut/> Sair</button></form></div>
    </aside>
    <main className="admin-main" id="conteudo-admin">{children}</main>
    {moreOpen&&<div className="admin-more-backdrop" onClick={()=>setMoreOpen(false)} aria-hidden="true"/>}
    {moreOpen&&<section id="admin-more-sheet" className="admin-more-sheet" aria-label="Mais áreas de gestão">
      <div className="admin-more-head"><div><strong>Mais áreas</strong><small>Administração Super Cell</small></div><button type="button" onClick={()=>setMoreOpen(false)} aria-label="Fechar menu"><X/></button></div>
      <nav aria-label="Áreas adicionais">{secondary.map(({href,label,Icon})=><Link href={href} key={href} aria-current={active(href)?"page":undefined} className={active(href)?"is-current":""}><Icon aria-hidden="true"/><span>{label}</span></Link>)}</nav>
      <div className="admin-more-user"><span>{user}</span><form action={logout}><button type="submit"><LogOut size={17}/> Sair</button></form></div>
    </section>}
    <nav className="admin-mobile-nav" aria-label="Navegação principal mobile">
      {primary.map(({href,label,Icon})=><Link href={href} key={href} aria-current={active(href)?"page":undefined} className={active(href)?"is-current":""}><Icon aria-hidden="true"/><span>{label}</span></Link>)}
      <button type="button" className={moreOpen||moreActive?"is-current":""} aria-expanded={moreOpen} aria-controls="admin-more-sheet" onClick={()=>setMoreOpen(v=>!v)}><Menu aria-hidden="true"/><span>Mais</span></button>
    </nav>
  </div>;
}
