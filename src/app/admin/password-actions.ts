"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

function safeOrigin(value: string | null) {
  if (value && /^https?:\/\//i.test(value)) return value;
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}

export async function requestPasswordReset(formData: FormData) {
  const email = z.string().email().parse(formData.get("email"));
  const requestHeaders = await headers();
  const origin = safeOrigin(requestHeaders.get("origin"));
  const supabase = await createClient();

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin/redefinir-senha`,
  });

  redirect(`/admin/login?message=${encodeURIComponent("Se esse e-mail estiver cadastrado, você receberá um link para criar uma nova senha.")}`);
}

export async function updateAdminPassword(formData: FormData) {
  const password = z.string().min(8, "A senha deve ter pelo menos 8 caracteres.").parse(formData.get("password"));
  const confirmPassword = z.string().min(8).parse(formData.get("confirm_password"));
  if (password !== confirmPassword) {
    redirect(`/admin/redefinir-senha?error=${encodeURIComponent("As senhas não coincidem.")}`);
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  if (!claimsData?.claims?.sub) {
    redirect(`/admin/login?error=${encodeURIComponent("O link de recuperação expirou. Solicite um novo.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect(`/admin/redefinir-senha?error=${encodeURIComponent("Não foi possível atualizar a senha. Solicite um novo link e tente novamente.")}`);
  }

  await supabase.auth.signOut();
  redirect(`/admin/login?message=${encodeURIComponent("Senha atualizada com sucesso. Entre com a nova senha.")}`);
}
