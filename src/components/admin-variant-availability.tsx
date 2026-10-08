"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import { setVariantCommercialStatus, type ProductStatusActionState } from "@/app/admin/product-status-actions";
import { useRouter } from "next/navigation";

type Status="available"|"restocking"|"hidden";

export function AdminVariantAvailability({
  variantId,
  initialStatus,
}:{
  variantId:string;
  initialStatus:Status;
}){
  const router=useRouter();
  const [status,setStatus]=useState<Status>(initialStatus);
  const [result,setResult]=useState<ProductStatusActionState>({status:"idle",message:""});
  const [pending,startTransition]=useTransition();

  function save(){
    setResult({status:"idle",message:""});
    startTransition(async()=>{
      const response=await setVariantCommercialStatus({variantId,status});
      setResult(response);
      if(response.status==="success")router.refresh();
    });
  }

  return <div className="variant-availability-control">
    <label>Disponibilidade desta variante
      <select value={status} onChange={(event)=>setStatus(event.target.value as Status)} disabled={pending}>
        <option value="available">Disponível — aparece na vitrine</option>
        <option value="restocking">Aguardando reposição — não aparece</option>
        <option value="hidden">Oculta — não aparece</option>
      </select>
    </label>
    <button type="button" onClick={save} disabled={pending} aria-busy={pending}>
      {pending?<><LoaderCircle className="spin"/> Salvando…</>:<><Save/> Salvar disponibilidade</>}
    </button>
    {result.status!=="idle"&&<div className={`admin-action-feedback ${result.status==="success"?"success":"error"}`} role="status" aria-live="polite">
      {result.status==="success"?<CheckCircle2/>:<TriangleAlert/>}<span>{result.message}</span>
    </div>}
  </div>;
}
