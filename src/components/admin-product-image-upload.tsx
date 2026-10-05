"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CheckCircle2, ImagePlus, LoaderCircle, TriangleAlert } from "lucide-react";
import { saveVariantImageWithFeedback, type ProductImageActionState } from "@/app/admin/product-image-actions";

const initialState: ProductImageActionState = { status: "idle", message: "" };

export function AdminProductImageUpload({ variantId, currentImage, canApplyToEquivalentVariants }: { variantId: string; currentImage?: string | null; canApplyToEquivalentVariants: boolean }) {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [state, formAction, pending] = useActionState(saveVariantImageWithFeedback, initialState);

  useEffect(() => {
    if (state.status === "success") {
      setPreview(null);
      setFileName("");
      router.refresh();
    }
  }, [state, router]);

  return <section className="admin-image-upload">
    <div><strong>Imagem do produto</strong><small>JPEG, PNG ou WebP · até 5 MB</small></div>
    <div className="admin-image-preview">{preview || currentImage ? <Image src={preview || currentImage!} alt="Prévia da imagem do produto" fill sizes="180px" unoptimized={Boolean(preview)} /> : <span>Sem imagem cadastrada</span>}</div>
    <input type="hidden" name="variant_id" value={variantId}/>
    <label className="admin-file-picker"><ImagePlus/> Trocar imagem<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" disabled={pending} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file); }}/></label>
    {fileName && <small className="admin-file-name">Nova imagem: {fileName}</small>}
    {canApplyToEquivalentVariants && <label className="admin-image-share"><input name="apply_to_equivalent_variants" type="checkbox" defaultChecked disabled={pending}/> Aplicar às variantes equivalentes do mesmo modelo e cor</label>}
    <button type="submit" formAction={formAction} className="admin-image-save" disabled={!preview || pending}>{pending ? <><LoaderCircle className="spin"/> Salvando…</> : "Salvar imagem"}</button>
    {state.status !== "idle" && <div role="status" aria-live="polite" style={{display:"flex",alignItems:"flex-start",gap:7,marginTop:10,fontSize:13,lineHeight:1.35,color:state.status==="success"?"#277654":"#9a433c"}}>{state.status === "success" ? <CheckCircle2 size={17}/> : <TriangleAlert size={17}/>}<span>{state.message}</span></div>}
  </section>;
}
