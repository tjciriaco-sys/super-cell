"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";

function InstagramIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg>;
}

export function Header({ compact = false, instagramUrl }: { compact?: boolean; instagramUrl?: string }) {
  const [hidden,setHidden]=useState(false);
  const lastY=useRef(0);
  const ticking=useRef(false);

  useEffect(()=>{
    const enterCatalog=()=>{lastY.current=window.scrollY;setHidden(true)};
    const onScroll=()=>{
      if(ticking.current)return;
      ticking.current=true;
      window.requestAnimationFrame(()=>{
        const y=window.scrollY;
        const delta=y-lastY.current;
        if(y<88)setHidden(false);
        else if(delta>7)setHidden(true);
        else if(delta<-7)setHidden(false);
        lastY.current=y;
        ticking.current=false;
      });
    };
    window.addEventListener("scroll",onScroll,{passive:true});
    window.addEventListener("supercell:catalog-enter",enterCatalog);
    return()=>{window.removeEventListener("scroll",onScroll);window.removeEventListener("supercell:catalog-enter",enterCatalog)};
  },[]);

  return <header className={`site-header smart-header ${hidden?"is-hidden":""}`}><div className="shell header-inner">
    <Link className="brand" href="/" aria-label="Super Cell — início"><span className="brand-logo-frame"><Image className="brand-logo" src="/super-cell-logo.webp" alt="" width={52} height={52} priority/></span><span><strong>SUPER</strong> CELL</span></Link>
    {!compact && <nav aria-label="Navegação principal"><Link href="/#catalogo"><Search size={18}/> Produtos</Link>{instagramUrl&&<a className="instagram-link" href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram da Super Cell"><InstagramIcon/><span>Instagram</span></a>}</nav>}
  </div></header>;
}
