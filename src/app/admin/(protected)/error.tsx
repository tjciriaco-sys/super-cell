"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";

export default function AdminError({reset}:{error:Error&{digest?:string};reset:()=>void}){
  return <section className="admin-error-screen" role="alert">
    <TriangleAlert/>
    <h2>Não foi possível concluir esta ação</h2>
    <p>O painel encontrou um erro ao salvar. Tente novamente. Se a ação continuar falhando, volte ao produto e revise os dados antes de salvar.</p>
    <div className="admin-error-actions">
      <button type="button" onClick={()=>reset()}>Tentar novamente</button>
      <Link href="/admin/produtos">Voltar para produtos</Link>
    </div>
  </section>;
}
