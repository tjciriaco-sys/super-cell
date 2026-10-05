import Link from "next/link";
import { Mail, Smartphone } from "lucide-react";
import { requestPasswordReset } from "@/app/admin/password-actions";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <main className="login-page">
      <div className="login-card">
        <div className="brand login-brand"><span className="brand-mark"><Smartphone/></span><span><strong>SUPER</strong> CELL</span></div>
        <div><span className="eyebrow">Recuperação de acesso</span><h1>Redefinir senha</h1><p>Informe o e-mail do administrador. Enviaremos um link seguro para criar uma nova senha.</p></div>
        {error && <p className="login-error">{error}</p>}
        <form action={requestPasswordReset}>
          <label>E-mail<input name="email" type="email" autoComplete="email" required /></label>
          <button type="submit"><Mail/> Enviar link de recuperação</button>
        </form>
        <Link href="/admin/login" style={{ display: "block", textAlign: "center", marginTop: 18, fontWeight: 800, color: "#9b6c13" }}>Voltar para o login</Link>
      </div>
    </main>
  );
}
