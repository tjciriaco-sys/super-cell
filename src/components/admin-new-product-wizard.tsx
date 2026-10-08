"use client";

import { useActionState, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, PackagePlus, Smartphone, Boxes, Apple } from "lucide-react";
import { createProductFromWizard, type ProductCreateState } from "@/app/admin/product-create-actions";
import { AdminChoiceSelect } from "@/components/admin-choice-select";

type Option={id:string;name:string;slug?:string|null;code?:string|null};
type ProductType="iphone"|"android"|"other";
const initialState:ProductCreateState={status:"idle",message:""};
const steps=["Tipo","Produto","Variante","Comercial","Foto e revisão"];

export function AdminNewProductWizard({brands,categories,suppliers}:{brands:Option[];categories:Option[];suppliers:Option[]}){
  const [step,setStep]=useState(0);
  const [productType,setProductType]=useState<ProductType>("iphone");
  const [condition,setCondition]=useState<"novo"|"seminovo">("novo");
  const [brandId,setBrandId]=useState("");
  const [categoryId,setCategoryId]=useState("");
  const [connectivity,setConnectivity]=useState("5G");
  const [grade,setGrade]=useState("excelente");
  const [original,setOriginal]=useState("true");
  const [opened,setOpened]=useState("true");
  const [status,setStatus]=useState("available");
  const [preview,setPreview]=useState<string|null>(null);
  const [fileName,setFileName]=useState("");
  const [state,action,pending]=useActionState(createProductFromWizard,initialState);

  const apple=brands.find((item)=>item.slug==="apple");
  const iphoneCategory=categories.find((item)=>item.slug==="iphone");
  const smartphoneCategory=categories.find((item)=>item.slug==="smartphones");

  const effectiveBrandId=productType==="iphone"?(apple?.id??""):brandId;
  const effectiveCategoryId=productType==="iphone"?(iphoneCategory?.id??""):productType==="android"?(smartphoneCategory?.id??""):categoryId;

  const brandOptions=useMemo(()=>brands.filter((item)=>item.slug!=="apple").map((item)=>({value:item.id,label:item.name})),[brands]);
  const otherCategoryOptions=useMemo(()=>categories.filter((item)=>!["iphone","smartphones"].includes(item.slug??"")).map((item)=>({value:item.id,label:item.name})),[categories]);
  const supplierOptions=useMemo(()=>suppliers.map((item)=>({value:item.id,label:`${item.code?item.code+" · ":""}${item.name}`})),[suppliers]);

  function move(next:number){
    setStep(Math.max(0,Math.min(steps.length-1,next)));
    window.scrollTo({top:0,behavior:"smooth"});
  }

  return <form action={action} className="admin-card guided-wizard">
    <input type="hidden" name="brand_id" value={effectiveBrandId}/>
    <input type="hidden" name="category_id" value={effectiveCategoryId}/>
    <div className="guided-wizard-head">
      <div><span className="eyebrow">Cadastro guiado</span><h1>Novo produto</h1><p>Etapa {step+1} de {steps.length} · {steps[step]}</p></div>
      <Link className="admin-outline" href="/admin/produtos" aria-label="Voltar para produtos"><ArrowLeft/></Link>
    </div>

    <div className="guided-progress">{steps.map((label,index)=><button type="button" key={label} className={index===step?"active":index<step?"done":""} onClick={()=>move(index)}>{index<step?<Check/>:<span>{index+1}</span>}<strong>{label}</strong></button>)}</div>

    <fieldset hidden={step!==0} className="guided-step">
      <div className="guided-step-title"><strong>1. Tipo de produto</strong><p>Comece pela família comercial. O cadastro se adapta a partir daqui.</p></div>
      <div className="product-type-grid">
        <button type="button" className={productType==="iphone"?"active":""} onClick={()=>setProductType("iphone")}><Apple/><strong>iPhone</strong><span>Apple já definida</span></button>
        <button type="button" className={productType==="android"?"active":""} onClick={()=>setProductType("android")}><Smartphone/><strong>Android</strong><span>Escolha a marca depois</span></button>
        <button type="button" className={productType==="other"?"active":""} onClick={()=>setProductType("other")}><Boxes/><strong>Outros produtos</strong><span>Tablets, perfumes e acessórios</span></button>
      </div>
      {productType==="android"&&<AdminChoiceSelect name="_brand_visual" label="Marca do Android" value={brandId} onChange={setBrandId} placeholder="Selecione a marca" options={brandOptions}/>}
      {productType==="other"&&<div className="guided-fields"><AdminChoiceSelect name="_category_visual" label="Categoria" value={categoryId} onChange={setCategoryId} placeholder="Selecione a categoria" options={otherCategoryOptions}/><AdminChoiceSelect name="_brand_visual" label="Marca" value={brandId} onChange={setBrandId} placeholder="Selecione a marca" options={brands.map((item)=>({value:item.id,label:item.name}))}/></div>}
    </fieldset>

    <fieldset hidden={step!==1} className="guided-step">
      <div className="guided-step-title"><strong>2. Produto</strong><p>Defina o modelo. As informações comuns às variantes ficam aqui.</p></div>
      <div className="guided-fields">
        <label className="guided-input-label">Modelo<input name="model" placeholder={productType==="iphone"?"Ex.: iPhone 18 Pro Max":"Ex.: Galaxy S27 Ultra"} autoComplete="off"/></label>
        <div className="guided-two">
          <AdminChoiceSelect name="condition" label="Condição" value={condition} onChange={(value)=>setCondition(value as "novo"|"seminovo")} options={[{value:"novo",label:"Novo · Lacrado"},{value:"seminovo",label:"Seminovo"}]}/>
          <AdminChoiceSelect name="connectivity" label="Conectividade" value={connectivity} onChange={setConnectivity} options={[{value:"5G",label:"5G"},{value:"4G",label:"4G"},{value:"",label:"Não se aplica"}]}/>
        </div>
        <label className="guided-input-label">Descrição comercial <small>(opcional)</small><textarea name="description" rows={4} placeholder="Resumo curto para a página do produto"/></label>
      </div>
    </fieldset>

    <fieldset hidden={step!==2} className="guided-step">
      <div className="guided-step-title"><strong>3. Primeira variante</strong><p>Cadastre a primeira unidade comercial. Outras variantes podem ser adicionadas depois sem recriar o produto.</p></div>
      <div className="guided-fields">
        <div className="guided-two"><label className="guided-input-label">Armazenamento (GB)<input name="storage_gb" type="number" min="0" placeholder="128"/></label><label className="guided-input-label">RAM (GB)<input name="ram_gb" type="number" min="0" placeholder="8"/></label></div>
        <div className="guided-two"><label className="guided-input-label">Cor comercial<input name="color" placeholder="Grafite"/></label><label className="guided-input-label">Cor visual<input name="color_hex" type="color" defaultValue="#1f2020"/></label></div>
        <label className="guided-input-label">Configuração do SIM <small>(opcional)</small><input name="sim_configuration" placeholder="Ex.: físico + eSIM"/></label>
        <label className="guided-input-label">SKU interno <small>(opcional)</small><input name="sku" placeholder="Se vazio, o sistema gera automaticamente"/></label>

        {condition==="seminovo"&&<div className="used-guided-panel">
          <div><strong>Condição desta unidade</strong><p>Bateria e estado são individuais por variante.</p></div>
          <div className="guided-two"><AdminChoiceSelect name="condition_grade" label="Classificação" value={grade} onChange={setGrade} options={[{value:"excelente",label:"Excelente"},{value:"muito_bom",label:"Muito bom"},{value:"bom",label:"Bom"}]}/><label className="guided-input-label">Saúde da bateria (%)<input name="battery_health_minimum" type="number" min="1" max="100" placeholder="Ex.: 90"/></label></div>
          <div className="guided-two"><AdminChoiceSelect name="original_components" label="Componentes originais?" value={original} onChange={setOriginal} options={[{value:"true",label:"Sim"},{value:"false",label:"Não"}]}/><AdminChoiceSelect name="never_opened" label="Nunca foi aberto?" value={opened} onChange={setOpened} options={[{value:"true",label:"Sim"},{value:"false",label:"Não"}]}/></div>
          <label className="guided-input-label">Garantia Super Cell (meses)<input name="warranty_months" type="number" min="0" max="60" defaultValue="3"/></label>
          <label className="guided-input-label">Observações da condição<input name="condition_details" maxLength={500} placeholder="Ex.: marcas leves na lateral"/></label>
        </div>}
      </div>
    </fieldset>

    <fieldset hidden={step!==3} className="guided-step">
      <div className="guided-step-title"><strong>4. Comercial</strong><p>Vincule a origem, custo e disponibilidade da primeira variante.</p></div>
      <div className="guided-fields">
        <AdminChoiceSelect name="supplier_id" label="Fornecedor" placeholder="Selecione o fornecedor" options={supplierOptions}/>
        <div className="guided-two"><label className="guided-input-label">Custo do fornecedor (R$)<input name="cost" type="number" min="0.01" step="0.01" placeholder="1460,00"/></label><label className="guided-input-label">Código externo <small>(opcional)</small><input name="external_code" placeholder="Código do fornecedor"/></label></div>
        <label className="guided-input-label">Preço Pix manual <small>(opcional)</small><input name="manual_price" type="number" min="0.01" step="0.01" placeholder="Deixe vazio para usar preço automático"/></label>
        <AdminChoiceSelect name="commercial_status" label="Disponibilidade da variante" value={status} onChange={setStatus} options={[{value:"available",label:"Disponível — aparece após QA"},{value:"restocking",label:"Aguardando reposição — não aparece"},{value:"hidden",label:"Oculta — não aparece"}]}/>
        <div className="guided-summary-box"><strong>Publicação segura</strong><span>O produto sempre nasce como rascunho. Depois da revisão, você decide quando aprovar o QA.</span></div>
      </div>
    </fieldset>

    <fieldset hidden={step!==4} className="guided-step">
      <div className="guided-step-title"><strong>5. Foto e revisão</strong><p>Adicione a foto real da primeira variante e conclua o cadastro.</p></div>
      <div className="guided-photo">
        <div className="guided-photo-preview">{preview?<Image src={preview} alt="Prévia do novo produto" fill unoptimized style={{objectFit:"contain",padding:12}}/>:<span><ImagePlus/><small>Imagem opcional nesta etapa</small></span>}</div>
        <label className="admin-file-picker"><ImagePlus/> Selecionar imagem<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event=>{const file=event.target.files?.[0];if(!file)return;setFileName(file.name);const reader=new FileReader();reader.onload=()=>setPreview(String(reader.result));reader.readAsDataURL(file);}}/></label>
        {fileName&&<small>Arquivo: {fileName}</small>}
      </div>
      <div className="guided-summary-box"><strong><PackagePlus/> Ao concluir</strong><span>Produto, primeira variante e oferta são criados juntos. Depois abriremos a nova central de gestão do modelo.</span></div>
    </fieldset>

    {state.status==="error"&&<div className="guided-error" role="alert"><AlertTriangle/><span>{state.message}</span></div>}
    <div className="guided-actions"><button type="button" className="admin-outline" onClick={()=>move(step-1)} disabled={step===0||pending}><ArrowLeft/> Voltar</button>{step<steps.length-1?<button type="button" className="admin-image-save" onClick={()=>move(step+1)}>Avançar <ArrowRight/></button>:<button type="submit" className="admin-image-save" disabled={pending}>{pending?<><LoaderCircle className="spin"/> Cadastrando…</>:<><PackagePlus/> Criar produto</>}</button>}</div>
  </form>;
}
