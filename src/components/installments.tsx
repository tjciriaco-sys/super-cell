"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { InstallmentPlan } from "@/lib/types";
import { money } from "@/lib/utils";

export function Installments({
  price,
  plans,
  featured,
  selectedInstallments,
  onSelect,
}: {
  price:number;
  plans:InstallmentPlan[];
  featured:number;
  selectedInstallments:number;
  onSelect:(installments:number)=>void;
}) {
  const [open,setOpen]=useState(false);
  const sorted=[...plans].filter((p)=>p.active).sort((a,b)=>a.installments-b.installments);
  const fallback=sorted.find((p)=>p.installments===featured)??sorted[sorted.length-1];
  const selected=sorted.find((p)=>p.installments===selectedInstallments)??fallback;
  if(!selected)return null;
  const total=price*Number(selected.factor);

  return <div className="installments-box">
    <p className="primary-installment">ou <strong>{selected.installments}x de {money.format(total/selected.installments)}</strong></p>
    <p className="installment-total">Total no cartão: {money.format(total)}</p>
    <button className="inline-accordion" type="button" onClick={()=>setOpen(!open)} aria-expanded={open}>
      Ver todas as parcelas <ChevronDown className={open?"rotated":""} size={18}/>
    </button>
    {open&&<div className="installment-grid" role="radiogroup" aria-label="Opções de parcelamento">
      {sorted.map((plan)=>{
        const cardTotal=price*Number(plan.factor);
        const isSelected=plan.installments===selected.installments;
        return <button
          type="button"
          className={`installment-option ${isSelected?"selected":""}`}
          role="radio"
          aria-checked={isSelected}
          key={plan.installments}
          onClick={()=>onSelect(plan.installments)}
        >
          <strong>{plan.installments}x de {money.format(cardTotal/plan.installments)}</strong>
          <small>Total {money.format(cardTotal)}</small>
        </button>;
      })}
    </div>}
  </div>;
}
