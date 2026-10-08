"use client";

import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, LoaderCircle, Pencil, Save, TriangleAlert, X } from "lucide-react";
import { useState, useTransition } from "react";
import { saveVariantIdentity, type ProductStatusActionState } from "@/app/admin/product-status-actions";
import { useRouter } from "next/navigation";

export function AdminVariantHeader({
  variantId, productName, index, total, ramGb, storageGb, color, colorHex, sku,
  conditionGrade, battery, pricingModeLabel, isManualPrice, commercialStatus, publicHref,
}:{
  variantId:string; productName:string; index:number; total:number;
  ramGb:number|null; storageGb:number|null; color:string|null; colorHex:string|null;
  sku:string; conditionGrade:string|null; battery:number|null; pricingModeLabel:string;
  isManualPrice:boolean; commercialStatus:"available"|"restocking"|"hidden"; publicHref:string|null;
}){
  const router=useRouter();
  const [editing,setEditing]=useState(false);
  const [draftColor,setDraftColor]=useState(color??"");
  const [draftHex,setDraftHex]=useState(colorHex??"#aaa39a");
  const [result,setResult]=useState<ProductStatusActionState>({status:"idle",message:""});
  const [pending,startTransition]=useTransition();

  const configuration=[ramGb?ramGb+" GB RAM":null,storageGb?storageGb+" GB":null,color].filter(Boolean).join(" · ");
  const meta=[sku,conditionGrade?conditionGrade.replace("_"," "):null,battery?"Bateria "+battery+"%":null].filter(Boolean).join(" · ");
  const statusLabel=commercialStatus==="available"?"Disponível":commercialStatus==="restocking"?"Reposição":"Oculta";

  function save(){
    setResult({status:"idle",message:""});
    startTransition(async()=>{
      const response=await saveVariantIdentity({variantId,color:draftColor,colorHex:draftHex||null});
      setResult(response);
      if(response.status==="success"){setEditing(false);router.refresh()}
    });
  }

  return <header className="variant-section-head">
    <div className="variant-kicker">Variante {index} de {total}</div>
    <div className="variant-section-main">
      <div className="variant-section-title">
        <strong>{productName}{configuration?" · "+configuration:""}</strong>
        <small>{meta}</small>
      </div>
      <div className="variant-section-actions">
        <span className={"variant-status-pill "+commercialStatus}>{statusLabel}</span>
        <span className={isManualPrice?"manual-tag":"status on"}>{isManualPrice?"Preço manual":pricingModeLabel}</span>
        {publicHref?<Link className="variant-preview-link" href={publicHref} target="_blank"><Eye/> Ver na vitrine</Link>:<span className="variant-preview-link disabled"><EyeOff/> Fora da vitrine</span>}
      </div>
    </div>

    <div className="variant-color-inline">
      {!editing?<><span>Cor: <strong>{color||"Não informada"}</strong></span><button type="button" onClick={()=>setEditing(true)}><Pencil/> Editar cor</button></>:<>
        <label>Cor comercial<input value={draftColor} onChange={(event)=>setDraftColor(event.target.value)} maxLength={50}/></label>
        <label className="color-code-edit">Cor visual<input type="color" value={draftHex} onChange={(event)=>setDraftHex(event.target.value)}/></label>
        <button type="button" className="save" onClick={save} disabled={pending}>{pending?<LoaderCircle className="spin"/>:<Save/>} Salvar</button>
        <button type="button" className="cancel" onClick={()=>{setDraftColor(color??"");setDraftHex(colorHex??"#aaa39a");setEditing(false);setResult({status:"idle",message:""})}} disabled={pending}><X/> Cancelar</button>
      </>}
    </div>
    {result.status!=="idle"&&<div className={"admin-action-feedback "+(result.status==="success"?"success":"error")} role="status" aria-live="polite">
      {result.status==="success"?<CheckCircle2/>:<TriangleAlert/>}<span>{result.message}</span>
    </div>}
  </header>;
}
