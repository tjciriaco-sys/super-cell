"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { InstallmentPlan } from "@/lib/types";
import { money } from "@/lib/utils";

export function Installments({ price, plans, featured }: { price:number; plans:InstallmentPlan[]; featured:number }) {
  const [open,setOpen]=useState(false);
  const sorted=[...plans].filter((p)=>p.active).sort((a,b)=>a.installments-b.installments);
  const primary=sorted.find((p)=>p.installments===featured)??sorted[sorted.length-1];
  if(!primary)return null;
  const total=price*Number(primary.factor);

  return <div className="installments-box">
    <p className="primary-installment">ou <strong>{primary.installments}x de {money.format(total/primary.installments)}</strong></p>
    <p className="installment-total">Total no cartão: {money.format(total)}</p>
    <button className="inline-accordion" type="button" onClick={()=>setOpen(!open)} aria-expanded={open}>
      Ver todas as parcelas <ChevronDown className={open?"rotated":""} size={18}/>
    </button>
    {open&&<div className="installment-grid" role="list" aria-label="Opções de parcelamento">
      {sorted.map((plan)=>{
        const cardTotal=price*Number(plan.factor);
        return <div className="installment-option" role="listitem" key={plan.installments}>
          <strong>{plan.installments}x de {money.format(cardTotal/plan.installments)}</strong>
          <small>Total {money.format(cardTotal)}</small>
        </div>;
      })}
    </div>}
  </div>;
}
