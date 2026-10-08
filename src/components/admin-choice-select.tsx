"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type AdminChoiceOption={value:string;label:string;description?:string};

export function AdminChoiceSelect({
  name,
  label,
  value:controlledValue,
  defaultValue="",
  options,
  placeholder="Selecione",
  onChange,
  disabled=false,
}:{
  name:string;
  label:string;
  value?:string;
  defaultValue?:string;
  options:AdminChoiceOption[];
  placeholder?:string;
  onChange?:(value:string)=>void;
  disabled?:boolean;
}){
  const controlled=controlledValue!==undefined;
  const [internal,setInternal]=useState(defaultValue);
  const [open,setOpen]=useState(false);
  const root=useRef<HTMLDivElement>(null);
  const value=controlled?controlledValue!:internal;
  const selected=options.find((option)=>option.value===value);

  useEffect(()=>{
    if(!open)return;
    const close=(event:MouseEvent)=>{
      if(root.current&&!root.current.contains(event.target as Node))setOpen(false);
    };
    document.addEventListener("mousedown",close);
    return()=>document.removeEventListener("mousedown",close);
  },[open]);

  function choose(next:string){
    if(!controlled)setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  return <div className="admin-choice" ref={root}>
    <input type="hidden" name={name} value={value}/>
    <span className="admin-choice-label">{label}</span>
    <button type="button" className={"admin-choice-trigger"+(open?" open":"")} onClick={()=>setOpen((current)=>!current)} disabled={disabled} aria-expanded={open}>
      <span>{selected?.label??placeholder}</span><ChevronDown/>
    </button>
    {open&&<div className="admin-choice-menu" role="listbox" aria-label={label}>
      {options.map((option)=><button type="button" key={option.value} className={"admin-choice-option"+(option.value===value?" selected":"")} onClick={()=>choose(option.value)} role="option" aria-selected={option.value===value}>
        <span><strong>{option.label}</strong>{option.description&&<small>{option.description}</small>}</span>
        {option.value===value&&<Check/>}
      </button>)}
    </div>}
  </div>;
}
