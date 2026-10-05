import Link from "next/link";
import { LockKeyhole, Smartphone } from "lucide-react";
import { updateAdminPassword } from "@/app/admin/password-actions";

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand login-brand"><span className="brand-mark"><Smartphone/></span><span><strong>SUPER</strong> CELL</span></div>
        <div><span className="eyebrow">Acesso protegido</span><h1>Crie uma nova senha</h1><p>Use uma senha com pelo menos 8 caracteres.</p></div>
        {error && <p className="login-error">{error}</p>}
        <form action={updateAdminPassword}>
          <label>Nova senha<input name="password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <label>Confirmar nova senha<input name="confirm_password" type="password" autoComplete="new-password" minLength={8} required /></label>
          <button type="submit"><LockKeyhole/> Salvar nova senha</button>
        </form>
        <Link href="/admin/login" style={{ display: "block", textAlign: "center", marginTop: 18, fontWeight: 800, color: "#9b6c13" }}>Voltar para o login</Link>
      </div>
    </main>
  );
}
