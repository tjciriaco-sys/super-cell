"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import { saveCatalogStatusWithFeedback, type ProductStatusActionState } from "@/app/admin/product-status-actions";

const initialState:ProductStatusActionState={status:"idle",message:""};

export function AdminProductStatusControls({
  productId,
  catalogStatus,
  commercialStatus,
}:{
  productId:string;
  catalogStatus:"draft"|"ready";
  commercialStatus:"available"|"coming_soon"|"restocking";
}){
  const router=useRouter();
  const [state,action,pending]=useActionState(saveCatalogStatusWithFeedback,initialState);
  useEffect(()=>{if(state.status==="success")router.refresh()},[state,router]);

  const summary={
    available:"Há pelo menos uma variante disponível",
    restocking:"Nenhuma variante disponível; há variante aguardando reposição",
    coming_soon:"Nenhuma variante está disponível na vitrine",
  }[commercialStatus];

  return <div className="admin-status-controls">
    <div className="admin-readiness-summary">
      <span>Situação comercial do modelo</span>
      <strong>{commercialStatus==="available"?"Disponível":commercialStatus==="restocking"?"Aguardando reposição":"Sem variante publicada"}</strong>
      <small>{summary}. Este status agora é calculado automaticamente pelas variantes abaixo.</small>
    </div>

    <form action={action} className="price-form catalog-status-form">
      <input type="hidden" name="product_id" value={productId}/>
      <label>Status do catálogo
        <select name="catalog_status" defaultValue={catalogStatus} disabled={pending}>
          <option value="draft">Rascunho — oculto da vitrine</option>
          <option value="ready">Revisado e aprovado — pode aparecer</option>
        </select>
      </label>
      <button type="submit" disabled={pending} aria-busy={pending}>
        {pending?<><LoaderCircle className="spin"/> Salvando…</>:<><Save/> Salvar status</>}
      </button>
    </form>
    {state.status!=="idle"&&<div className={`admin-action-feedback ${state.status==="success"?"success":"error"}`} role="status" aria-live="polite">
      {state.status==="success"?<CheckCircle2/>:<TriangleAlert/>}<span>{state.message}</span>
    </div>}
  </div>;
}
