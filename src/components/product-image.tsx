"use client";

import Image from "next/image";
import { Minus, Plus, Smartphone, X } from "lucide-react";
import { useEffect, useState } from "react";

export function ProductImage({ src, alt, priority = false, zoomable = true }: { src?: string; alt: string; priority?: boolean; zoomable?: boolean }) {
  const [open,setOpen]=useState(false);
  const [scale,setScale]=useState(1);

  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    window.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
  },[open]);

  useEffect(()=>{if(!open)setScale(1)},[open]);

  if(!src)return <div className="product-image-wrap"><div className="image-placeholder" aria-label="Imagem em preparação"><Smartphone size={58}/><span>Imagem em preparação</span></div></div>;

  return <>
    {zoomable?<button type="button" className="product-image-button" onClick={()=>setOpen(true)} aria-label="Ampliar imagem do produto">
      <div className="product-image-wrap">
        <Image src={src} alt={alt} fill sizes="(max-width: 640px) 44vw, (max-width: 1100px) 30vw, 260px" priority={priority} className="product-image"/>
      </div>
    </button>:<div className="product-image-wrap">
      <Image src={src} alt={alt} fill sizes="(max-width: 640px) 44vw, (max-width: 1100px) 30vw, 260px" priority={priority} className="product-image"/>
    </div>}
    {zoomable&&open&&<div className="image-lightbox" role="dialog" aria-modal="true" aria-label="Imagem ampliada do produto" onClick={()=>setOpen(false)}>
      <div className="image-lightbox-panel" onClick={(event)=>event.stopPropagation()}>
        <div className="image-lightbox-toolbar">
          <span>Amplie para ver os detalhes</span>
          <div>
            <button type="button" onClick={()=>setScale((value)=>Math.max(1,value-.5))} aria-label="Reduzir imagem"><Minus/></button>
            <button type="button" onClick={()=>setScale((value)=>Math.min(4,value+.5))} aria-label="Ampliar imagem"><Plus/></button>
            <button type="button" className="close" onClick={()=>setOpen(false)} aria-label="Fechar imagem"><X/></button>
          </div>
        </div>
        <div className="image-lightbox-stage">
          <div className="image-lightbox-image" style={{transform:`scale(${scale})`}}>
            <Image src={src} alt={alt} fill sizes="96vw" className="product-image product-image-large" priority/>
          </div>
        </div>
      </div>
    </div>}
  </>;
}
