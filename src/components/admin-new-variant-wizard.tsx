"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, PackagePlus } from "lucide-react";
import { createVariantFromWizard, type ProductCreateState } from "@/app/admin/product-create-actions";
import { AdminChoiceSelect } from "@/components/admin-choice-select";

type Supplier={id:string;name:string;code?:string|null};
type Prefill={
  ram_gb?:number|null;storage_gb?:number|null;color?:string|null;color_hex?:string|null;sim_configuration?:string|null;
  condition_grade?:string|null;battery_health_minimum?:number|null;original_components?:boolean|null;never_opened?:boolean|null;
  warranty_months?:number|null;condition_details?:string|null;manual_price?:number|null;supplier_id?:string|null;cost?:number|null;external_code?:string|null;
};

const initialState:ProductCreateState={status:"idle",message:""};
const steps=["Configuração","Condição","Comercial","Foto e revisão"];

export function AdminNewVariantWizard({
  product,
  suppliers,
  prefill={},
}:{
  product:{id:string;name:string;model:string;condition:"novo"|"seminovo";connectivity:string|null;brand_name:string|null;category_name:string|null};
  suppliers:Supplier[];
  prefill?:Prefill;
}){
  const [step,setStep]=useState(0);
  const [preview,setPreview]=useState<string|null>(null);
  const [fileName,setFileName]=useState("");
  const [state,action,pending]=useActionState(createVariantFromWizard,initialState);
  const [status,setStatus]=useState("available");
  const [grade,setGrade]=useState(prefill.condition_grade??"excelente");
  const [original,setOriginal]=useState(String(prefill.original_components??true));
  const [opened,setOpened]=useState(String(prefill.never_opened??true));
  const supplierOptions=useMemo(()=>suppliers.map((item)=>({value:item.id,label:`${item.code?item.code+" · ":""}${item.name}`})),[suppliers]);

  function move(next:number){
    setStep(Math.max(0,Math.min(steps.length-1,next)));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  return <form action={action} className="admin-card guided-wizard">
    <input type="hidden" name="product_id" value={product.id}/>
    <div className="guided-wizard-head">
      <div><span className="eyebrow">Cadastro guiado</span><h1>Nova variante</h1><p>{product.name}</p><small>{product.brand_name} · {product.category_name} · {product.condition} · {product.connectivity??"sem conectividade"}</small></div>
      <Link className="admin-outline" href={`/admin/produtos/${product.id}`} aria-label="Voltar"><ArrowLeft/></Link>
    </div>

    <div className="guided-progress">{steps.map((label,index)=><button type="button" key={label} className={index===step?"active":index<step?"done":""} onClick={()=>move(index)}>{index<step?<Check/>:<span>{index+1}</span>}<strong>{label}</strong></button>)}</div>

    <fieldset hidden={step!==0} className="guided-step">
      <div className="guided-step-title"><strong>1. Configuração</strong><p>Cadastre somente o que muda nesta unidade. O modelo e a categoria já vêm do produto.</p></div>
      <div className="price-form guided-fields">
        <div className="guided-two"><label>Armazenamento (GB)<input name="storage_gb" type="number" min="0" defaultValue={prefill.storage_gb??""} placeholder="128"/></label><label>RAM (GB)<input name="ram_gb" type="number" min="0" defaultValue={prefill.ram_gb??""} placeholder="8"/></label></div>
        <div className="guided-two"><label>Cor comercial<input name="color" defaultValue={prefill.color??""} placeholder="Grafite"/></label><label>Cor visual<input name="color_hex" type="color" defaultValue={prefill.color_hex??"#1f2020"}/></label></div>
        <label>Configuração do SIM <small>(opcional)</small><input name="sim_configuration" defaultValue={prefill.sim_configuration??""} placeholder="Ex.: físico + eSIM"/></label>
        <label>SKU interno <small>(opcional)</small><input name="sku" placeholder="Se vazio, o sistema gera automaticamente"/></label>
      </div>
    </fieldset>

    <fieldset hidden={step!==1} className="guided-step">
      <div className="guided-step-title"><strong>2. Condição</strong><p>{product.condition==="seminovo"?"Registre os dados específicos desta unidade seminova.":"Produto novo: revise apenas os dados que realmente variam por unidade."}</p></div>
      {product.condition==="seminovo"?<div className="guided-fields">
        <div className="guided-two">
          <AdminChoiceSelect name="condition_grade" label="Classificação" value={grade} onChange={setGrade} options={[{value:"excelente",label:"Excelente"},{value:"muito_bom",label:"Muito bom"},{value:"bom",label:"Bom"}]}/>
          <label className="guided-input-label">Saúde da bateria (%)<input name="battery_health_minimum" type="number" min="1" max="100" defaultValue={prefill.battery_health_minimum??""} placeholder="Ex.: 90"/></label>
        </div>
        <div className="guided-two">
          <AdminChoiceSelect name="original_components" label="Componentes originais?" value={original} onChange={setOriginal} options={[{value:"true",label:"Sim"},{value:"false",label:"Não"}]}/>
          <AdminChoiceSelect name="never_opened" label="Nunca foi aberto?" value={opened} onChange={setOpened} options={[{value:"true",label:"Sim"},{value:"false",label:"Não"}]}/>
        </div>
        <label className="guided-input-label">Garantia Super Cell (meses)<input name="warranty_months" type="number" min="0" max="60" defaultValue={prefill.warranty_months??3}/></label>
        <label className="guided-input-label">Observações da condição<input name="condition_details" maxLength={500} defaultValue={prefill.condition_details??""} placeholder="Ex.: marcas leves na lateral"/></label>
      </div>:<div className="guided-summary-box"><strong>Novo · Lacrado</strong><span>Nenhuma condição adicional é necessária para esta variante.</span></div>}
    </fieldset>

    <fieldset hidden={step!==2} className="guided-step">
      <div className="guided-step-title"><strong>3. Comercial</strong><p>Vincule a origem, o custo e defina se esta variante já entra disponível.</p></div>
      <div className="guided-fields">
        <AdminChoiceSelect name="supplier_id" label="Fornecedor" defaultValue={prefill.supplier_id??""} placeholder="Selecione o fornecedor" options={supplierOptions}/>
        <div className="guided-two"><label className="guided-input-label">Custo do fornecedor (R$)<input name="cost" type="number" min="0.01" step="0.01" defaultValue={prefill.cost??""} placeholder="1460,00"/></label><label className="guided-input-label">Código externo <small>(opcional)</small><input name="external_code" defaultValue={prefill.external_code??""} placeholder="Código do fornecedor"/></label></div>
        <label className="guided-input-label">Preço Pix manual <small>(opcional)</small><input name="manual_price" type="number" min="0.01" step="0.01" defaultValue={prefill.manual_price??""} placeholder="Deixe vazio para usar preço automático"/></label>
        <AdminChoiceSelect name="commercial_status" label="Disponibilidade da variante" value={status} onChange={setStatus} options={[{value:"available",label:"Disponível — aparece na vitrine"},{value:"restocking",label:"Aguardando reposição — não aparece"},{value:"hidden",label:"Oculta — não aparece"}]}/>
      </div>
    </fieldset>

    <fieldset hidden={step!==3} className="guided-step">
      <div className="guided-step-title"><strong>4. Foto e revisão</strong><p>Adicione a foto real da unidade. Se preferir, você pode concluir e enviar a imagem depois.</p></div>
      <div className="guided-photo">
        <div className="guided-photo-preview">{preview?<Image src={preview} alt="Prévia da variante" fill unoptimized style={{objectFit:"contain",padding:12}}/>:<span><ImagePlus/><small>Imagem opcional nesta etapa</small></span>}</div>
        <label className="admin-file-picker"><ImagePlus/> Selecionar imagem<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event=>{const file=event.target.files?.[0];if(!file)return;setFileName(file.name);const reader=new FileReader();reader.onload=()=>setPreview(String(reader.result));reader.readAsDataURL(file);}}/></label>
        {fileName&&<small>Arquivo: {fileName}</small>}
      </div>
      <div className="guided-summary-box"><strong><PackagePlus/> Ao concluir</strong><span>A nova variante entra no mesmo produto e volta para a tela de gestão do modelo.</span></div>
    </fieldset>

    {state.status==="error"&&<div className="guided-error" role="alert"><AlertTriangle/><span>{state.message}</span></div>}

    <div className="guided-actions"><button type="button" className="admin-outline" onClick={()=>move(step-1)} disabled={step===0||pending}><ArrowLeft/> Voltar</button>{step<steps.length-1?<button type="button" className="admin-image-save" onClick={()=>move(step+1)}>Avançar <ArrowRight/></button>:<button type="submit" className="admin-image-save" disabled={pending}>{pending?<><LoaderCircle className="spin"/> Cadastrando…</>:<><PackagePlus/> Criar variante</>}</button>}</div>
  </form>;
}
