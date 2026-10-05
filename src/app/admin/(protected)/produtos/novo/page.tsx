import { createClient } from "@/lib/supabase/server";
import { AdminNewProductWizard } from "@/components/admin-new-product-wizard";

export default async function NewProductPage() {
  const supabase = await createClient();
  const [{ data: brands }, { data: categories }, { data: suppliers }] = await Promise.all([
    supabase.from("brands").select("id,name,slug").eq("active", true).order("name"),
    supabase.from("categories").select("id,name,slug").eq("active", true).order("sort_order").order("name"),
    supabase.from("suppliers").select("id,name,code").eq("active", true).order("code"),
  ]);

  return <AdminNewProductWizard brands={brands ?? []} categories={categories ?? []} suppliers={suppliers ?? []}/>;
}
