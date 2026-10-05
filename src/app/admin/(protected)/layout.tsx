import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin-shell";
export const dynamic="force-dynamic";
export default async function ProtectedLayout({children}:{children:React.ReactNode}){const supabase=await createClient();const {data:claimData}=await supabase.auth.getClaims();const claims=claimData?.claims;if(!claims?.sub)redirect("/admin/login");const {data:profile}=await supabase.from("admin_profiles").select("full_name,role,active").eq("user_id",claims.sub).single();if(!profile?.active)redirect("/admin/login?error=Acesso%20administrativo%20não%20autorizado.");return <AdminShell user={profile.full_name||String(claims.email||"Administrador")}>{children}</AdminShell>}
