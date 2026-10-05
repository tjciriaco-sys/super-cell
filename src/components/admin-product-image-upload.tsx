"use client";

import { useState } from "react";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import { saveVariantImage } from "@/app/admin/actions";

export function AdminProductImageUpload({ variantId, currentImage, canApplyToEquivalentVariants }: { variantId: string; currentImage?: string | null; canApplyToEquivalentVariants: boolean }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  return <section className="admin-image-upload">
    <div><strong>Imagem do produto</strong><small>JPEG, PNG ou WebP · até 5 MB</small></div>
    <div className="admin-image-preview">{preview || currentImage ? <Image src={preview || currentImage!} alt="Prévia da imagem do produto" fill sizes="180px" unoptimized={Boolean(preview)} /> : <span>Sem imagem cadastrada</span>}</div>
    <input type="hidden" name="variant_id" value={variantId}/>
    <label className="admin-file-picker"><ImagePlus/> Trocar imagem<input name="image_file" type="file" accept="image/jpeg,image/png,image/webp" required onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; setFileName(file.name); const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file); }}/></label>
    {fileName && <small className="admin-file-name">Nova imagem: {fileName}</small>}
    {canApplyToEquivalentVariants && <label className="admin-image-share"><input name="apply_to_equivalent_variants" type="checkbox" defaultChecked/> Aplicar às variantes equivalentes do mesmo modelo e cor</label>}
    <button type="submit" formAction={saveVariantImage} className="admin-image-save" disabled={!preview}>Salvar imagem</button>
  </section>;
}
