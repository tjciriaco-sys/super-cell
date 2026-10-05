import Link from "next/link";
import { LockKeyhole, Smartphone } from "lucide-react";
import { login } from "@/app/admin/actions";

export default async function LoginPage({searchParams}:{searchParams:Promise<{error?:string;message?:string}>}){
  const {error,message}=await searchParams;
  return <main className="login-page"><div className="login-card"><div className="brand login-brand"><span className="brand-mark"><Smartphone/></span><span><strong>SUPER</strong> CELL</span></div><div><span className="eyebrow">Acesso protegido</span><h1>Painel administrativo</h1><p>Entre para gerenciar produtos, preços, pagamentos e rotas.</p></div>{error&&<p className="login-error">{error}</p>}{message&&<p style={{padding:"12px 14px",borderRadius:12,background:"#f3fbf6",border:"1px solid #cce8d6",color:"#176b4b",fontWeight:700}}>{message}</p>}<form action={login}><label>E-mail<input name="email" type="email" autoComplete="email" required/></label><label>Senha<input name="password" type="password" autoComplete="current-password" minLength={8} required/></label><div style={{textAlign:"right",marginTop:-6}}><Link href="/admin/esqueci-senha" style={{fontSize:14,fontWeight:800,color:"#9b6c13"}}>Esqueci minha senha</Link></div><button type="submit"><LockKeyhole/> Entrar com segurança</button></form><small>Os custos e as regras internas nunca aparecem no catálogo público.</small></div></main>
}
