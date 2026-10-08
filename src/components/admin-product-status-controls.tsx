"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, Save, TriangleAlert } from "lucide-react";
import {
  saveCatalogStatusWithFeedback,
  saveCommercialStatusWithFeedback,
  type ProductStatusActionState,
} from "@/app/admin/product-status-actions";

const initialState:ProductStatusActionState={status:"idle",message:""};

function Feedback({state}:{state:ProductStatusActionState}){
  if(state.status==="idle")return null;
  const ok=state.status==="success";
  return <div className={`admin-action-feedback ${ok?"success":"error"}`} role="status" aria-live="polite">
    {ok?<CheckCircle2/>:<TriangleAlert/>}<span>{state.message}</span>
  </div>;
}

export function AdminProductStatusControls({
  productId,
  catalogStatus,
  commercialStatus,
  activeVariantCount,
  validOfferVariantCount,
}:{
  productId:string;
  catalogStatus:"draft"|"ready";
  commercialStatus:"available"|"coming_soon"|"restocking";
  activeVariantCount:number;
  validOfferVariantCount:number;
}){
  const router=useRouter();
  const [catalogState,catalogAction,catalogPending]=useActionState(saveCatalogStatusWithFeedback,initialState);
  const [commercialState,commercialAction,commercialPending]=useActionState(saveCommercialStatusWithFeedback,initialState);

  useEffect(()=>{if(catalogState.status==="success"||commercialState.status==="success")router.refresh()},[catalogState,commercialState,router]);

  const missingOffers=Math.max(0,activeVariantCount-validOfferVariantCount);

  return <div className="admin-status-controls">
    {missingOffers>0&&<div className="admin-readiness-warning">
      <TriangleAlert/>
      <div><strong>{missingOffers} variante(s) sem oferta ativa</strong><span>Ao salvar “Disponível”, o painel reativa automaticamente a oferta válida mais recente de cada variante.</span></div>
    </div>}

    <form action={catalogAction} className="price-form catalog-status-form">
      <input type="hidden" name="product_id" value={productId}/>
      <label>Status do catálogo
        <select name="catalog_status" defaultValue={catalogStatus} disabled={catalogPending}>
          <option value="draft">Rascunho — oculto da vitrine</option>
          <option value="ready">QA aprovado — pode aparecer</option>
        </select>
      </label>
      <button type="submit" disabled={catalogPending} aria-busy={catalogPending}>
        {catalogPending?<><LoaderCircle className="spin"/> Salvando…</>:<><Save/> Salvar status</>}
      </button>
    </form>
    <Feedback state={catalogState}/>

    <form action={commercialAction} className="price-form catalog-status-form">
      <input type="hidden" name="product_id" value={productId}/>
      <label>Situação comercial
        <select name="commercial_status" defaultValue={commercialStatus} disabled={commercialPending}>
          <option value="available">Disponível</option>
          <option value="coming_soon">Em breve</option>
          <option value="restocking">Aguardando reposição</option>
        </select>
      </label>
      <button type="submit" disabled={commercialPending} aria-busy={commercialPending}>
        {commercialPending?<><LoaderCircle className="spin"/> Salvando…</>:<><Save/> Salvar situação</>}
      </button>
    </form>
    <Feedback state={commercialState}/>
  </div>;
}
