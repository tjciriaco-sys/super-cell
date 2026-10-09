"use client";
import { useState } from "react";

export function CatalogCta(){
  const [pressed,setPressed]=useState(false);
  const go=()=>{
    setPressed(true);
    window.dispatchEvent(new Event("supercell:catalog-enter"));
    window.setTimeout(()=>{
      const target=document.getElementById("catalogo");
      if(target){
        const top=target.getBoundingClientRect().top+window.scrollY-8;
        window.scrollTo({top:Math.max(0,top),behavior:"smooth"});
        window.history.replaceState(window.history.state,"",`${window.location.pathname}${window.location.search}#catalogo`);
      }
    },70);
    window.setTimeout(()=>setPressed(false),520);
  };
  return <button type="button" className={`primary-button catalog-cta ${pressed?"is-pressed":""}`} onClick={go}>Escolher meu celular <span className="cta-emoji" aria-hidden="true">👇🏽</span><span className="cta-feedback" aria-hidden="true"/></button>;
}
