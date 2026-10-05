"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, PackagePlus } from "lucide-react";
import { createProductFromWizard, type ProductCreateState } from "@/app/admin/product-create-actions";

type Option = { id: string; name: string; slug?: string | null; code?: string | null };

const initialState: ProductCreateState = { status: "idle", message: "" };
const steps = ["Produto", "Configuração", "Comercial", "Foto e revisão"];

export function AdminNewProductWizard({ brands, categories, suppliers }: { brands: Option[]; categories: Option[]; suppliers: Option[] }) {
  const [step, setStep] = useState(0);
  const [condition, setCondition] = useState<"novo" | "seminovo">("novo");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [state, action, pending] = useActionState(createProductFromWizard, initialState);

  const move = (next: number) => {
    setStep(Math.max(0, Math.min(steps.length - 1, next)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cardStyle = { display: "grid", gap: 16 } as const;
  const twoCols = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12 } as const;
  const noteStyle = { margin: 0, color: "#777168", fontSize: 13, lineHeight: 1.45 } as const;

  return <form action={action} className="admin-card" style={{display:"grid",gap:18}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"flex-start"}}>
      <div>
        <span className="eyebrow">Cadastro guiado</span>
        <h1 style={{margin:"4px 0 6px",fontSize:"clamp(34px,9vw,54px)",lineHeight:.96}}>Novo produto</h1>
        <p style={noteStyle}>Etapa {step + 1} de {steps.length} · {steps[step]}</p>
      </div>
      <Link className="admin-outline" href="/admin/produtos" aria-label="Voltar para produtos"><ArrowLeft/></Link>
    </div>

    <div style={{display:"grid",gridTemplateColumns:`repeat(${steps.length},1fr)`,gap:6}} aria-label="Progresso do cadastro">
      {steps.map((label,index)=><button key={label} type="button" onClick={()=>move(index)} style={{border:"1px solid #ded8cd",borderRadius:12,padding:"9px 5px",background:index===step?"#17130c":index<step?"#f5ecd5":"#fff",color:index===step?"#fff":"#766b59",fontSize:10,fontWeight:800,lineHeight:1.15}}>{index<step?<Check size={13} style={{margin:"0 auto 3px"}}/>:<span style={{display:"block",marginBottom:3}}>{index+1}</span>}{label}</button>)}
    </div>

    <fieldset hidden={step!==0} style={{border:0,padding:0,margin:0,...cardStyle}}>
      <div><strong style={{fontSize:22}}>1. Identificação</strong><p style={noteStyle}>Defina o que é o produto. O restante do cadastro se adapta a estas escolhas.</p></div>
      <div className="price-form" style={cardStyle}>
        <label>Marca<select name="brand_id" defaultValue=""><option value="" disabled>Selecione a marca</option>{brands.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Categoria<select name="category_id" defaultValue=""><option value="" disabled>Selecione a categoria</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Modelo<input name="model" placeholder="Ex.: iPhone 15 Pro Max" autoComplete="off"/></label>
        <div style={twoCols}>
          <label>Condição<select name="condition" value={condition} onChange={event=>setCondition(event.target.value as "novo"|"seminovo")}><option value="novo">Novo · Lacrado</option><option value="seminovo">Seminovo</option></select></label>
          <label>Conectividade<select name="connectivity" defaultValue="5G"><option value="">Não se aplica</option><option value="4G">4G</option><option value="5G">5G</option></select></label>
        </div>
        <label>Descrição comercial <small style={{fontWeight:400,color:"#8c857b"}}>(opcional)</small><textarea name="description" rows={4} placeholder="Resumo curto para a página do produto" style={{width:"100%",border:"1px solid #ded8cd",borderRadius:14,padding:14,font: "inherit",resize:"vertical"}}/></label>
      </div>
    </fieldset>

    <fieldset hidden={step!==1} style={{border:0,padding:0,margin:0,...cardStyle}}>
      <div><strong style={{fontSize:22}}>2. Configuração</strong><p style={noteStyle}>Cadastre a variante que está entrando no estoque. Outras variantes podem ser adicionadas depois.</p></div>
      <div className="price-form" style={cardStyle}>
        <div style={twoCols}><label>Armazenamento (GB)<input name="storage_gb" type="number" min="0" placeholder="128"/></label><label>RAM (GB)<input name="ram_gb" type="number" min="0" placeholder="8"/></label></div>
        <div style={twoCols}><label>Cor comercial<input name="color" placeholder="Preto"/></label><label>Cor visual<input name="color_hex" type="color" defaultValue="#1f2020"/></label></div>
        <label>Configuração do SIM <small style={{fontWeight:400,color:"#8c857b"}}>(opcional)</small><input name="sim_configuration" placeholder="Ex.: físico + eSIM"/></label>
        <label>SKU interno <small style={{fontWeight:400,color:"#8c857b"}}>(opcional)</small><input name="sku" placeholder="Se vazio, o sistema gera automaticamente"/></label>

        {condition === "seminovo" && <div style={{display:"grid",gap:14,padding:16,border:"1px solid #e4d09a",borderRadius:18,background:"#fffaf0"}}>
          <strong style={{fontSize:18,color:"#7b5b16"}}>Condição do seminovo</strong>
          <div style={twoCols}><label>Classificação<select name="condition_grade" defaultValue="excelente"><option value="excelente">Excelente</option><option value="muito_bom">Muito bom</option><option value="bom">Bom</option></select></label><label>Saúde da bateria (%)<input name="battery_health_minimum" type="number" min="1" max="100" placeholder="Ex.: 92"/></label></div>
          <div style={twoCols}><label>Componentes originais?<select name="original_components" defaultValue="true"><option value="true">Sim</option><option value="false">Não</option></select></label><label>Nunca foi aberto?<select name="never_opened" defaultValue="true"><option value="true">Sim</option><option value="false">Não</option></select></label></div>
          <label>Garantia Super Cell (meses)<input name="warranty_months" type="number" min="0" max="60" defaultValue="3"/></label>
          <label>Observações da condição<input name="condition_details" maxLength={500} placeholder="Ex.: marcas leves na lateral"/></label>
          <p style={noteStyle}>A bateria é individual por unidade. Se não souber o percentual, deixe em branco e o produto continuará em rascunho até você completar.</p>
        </div>}
      </div>
    </fieldset>

    <fieldset hidden={step!==2} style={{border:0,padding:0,margin:0,...cardStyle}}>
      <div><strong style={{fontSize:22}}>3. Comercial</strong><p style={noteStyle}>Vincule a origem e o custo. O preço automático seguirá as faixas oficiais da Super Cell.</p></div>
      <div className="price-form" style={cardStyle}>
        <label>Fornecedor<select name="supplier_id" defaultValue=""><option value="" disabled>Selecione o fornecedor</option>{suppliers.map(item=><option key={item.id} value={item.id}>{item.code ? `${item.code} · ` : ""}{item.name}</option>)}</select></label>
        <div style={twoCols}><label>Custo do fornecedor (R$)<input name="cost" type="number" min="0.01" step="0.01" placeholder="1460,00"/></label><label>Código externo <small style={{fontWeight:400,color:"#8c857b"}}>(opcional)</small><input name="external_code" placeholder="Código do fornecedor"/></label></div>
        <label>Preço Pix manual <small style={{fontWeight:400,color:"#8c857b"}}>(opcional)</small><input name="manual_price" type="number" min="0.01" step="0.01" placeholder="Deixe vazio para usar preço automático"/></label>
        <label>Situação comercial<select name="commercial_status" defaultValue="available"><option value="available">Disponível</option><option value="coming_soon">Em breve</option><option value="restocking">Aguardando reposição</option></select></label>
        <p style={noteStyle}>Mesmo quando estiver disponível, o novo produto nasce como <strong>rascunho</strong>. Você revisa a tela final e decide quando publicar.</p>
      </div>
    </fieldset>

    <fieldset hidden={step!==3} style={{border:0,padding:0,margin:0,...cardStyle}}>
      <div><strong style={{fontSize:22}}>4. Foto e revisão</strong><p style={noteStyle}>Adicione a imagem agora ou deixe para a tela de edição. Ao concluir, abriremos o produto para sua revisão final.</p></div>
      <div style={{display:"grid",gap:14,padding:16,border:"1px solid #e1dbd0",borderRadius:18,background:"#fbfaf7"}}>
        <div style={{width:"100%",maxWidth:280,aspectRatio:"1/1",position:"relative",borderRadius:16,overflow:"hidden",border:"1px solid #e1dbd0",background:"#fff",display:"grid",placeItems:"center",color:"#938b80"}}>{preview?<Image src={preview} alt="Prévia do novo produto" fill unoptimized style={{objectFit:"contain",padding:12}}/>:<span style={{display:"grid",placeItems:"center",gap:8,textAlign:"center"}}><ImagePlus/><small>Imagem opcional nesta etapa</small></span>}</div>
        <label className="admin-file-picker"><ImagePlus/> Selecionar imagem<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={event=>{const file=event.target.files?.[0];if(!file)return;setFileName(file.name);const reader=new FileReader();reader.onload=()=>setPreview(String(reader.result));reader.readAsDataURL(file);}}/></label>
        {fileName&&<small style={{color:"#746f67"}}>Arquivo: {fileName}</small>}
      </div>
      <div style={{display:"grid",gap:8,padding:15,borderRadius:16,background:"#f6efdf",color:"#6d531f"}}><strong style={{display:"flex",alignItems:"center",gap:7}}><PackagePlus size={18}/> O que acontece ao concluir?</strong><span style={{fontSize:13,lineHeight:1.45}}>O sistema cria produto, variante e oferta do fornecedor, aplica a foto se você selecionou uma e abre a página de edição. O item permanece oculto da vitrine até você marcar “QA aprovado”.</span></div>
    </fieldset>

    {state.status === "error" && <div role="alert" style={{display:"flex",gap:8,alignItems:"flex-start",padding:12,borderRadius:14,background:"#fff1ef",color:"#934038",fontSize:13,lineHeight:1.4}}><AlertTriangle size={18}/><span>{state.message}</span></div>}

    <div style={{display:"flex",gap:10,justifyContent:"space-between",paddingTop:4}}>
      <button type="button" onClick={()=>move(step-1)} disabled={step===0||pending} className="admin-outline" style={{opacity:step===0?.35:1}}><ArrowLeft/> Voltar</button>
      {step<steps.length-1?<button type="button" onClick={()=>move(step+1)} className="admin-image-save">Avançar <ArrowRight/></button>:<button type="submit" className="admin-image-save" disabled={pending}>{pending?<><LoaderCircle className="spin"/> Cadastrando…</>:<><PackagePlus/> Criar produto</>}</button>}
    </div>
  </form>;
}
