import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function InterestsPage(){
  const supabase=await createClient();
  const {data,error}=await supabase.from("product_interests").select("product_id,commercial_status,product:products(name),variant:product_variants(ram_gb,storage_gb)").order("created_at",{ascending:false});
  if(error)throw error;
  const demand=new Map<string,{name:string;configuration:string;status:string;count:number}>();
  for(const row of data??[]){const p=row.product as unknown as {name:string}|null;const v=row.variant as unknown as {ram_gb:number|null;storage_gb:number|null}|null;const configuration=[v?.ram_gb?`${v.ram_gb} GB RAM`:null,v?.storage_gb?`${v.storage_gb} GB`:null].filter(Boolean).join(" + ");const key=`${row.product_id}:${configuration}:${row.commercial_status}`;const current=demand.get(key);if(current)current.count++;else demand.set(key,{name:p?.name??"Produto",configuration,status:row.commercial_status,count:1})}
  const rows=[...demand.values()].sort((a,b)=>b.count-a.count);
  return <><div className="admin-heading"><div><span className="eyebrow">Sinais comerciais</span><h1>Demanda por produtos sem estoque</h1></div></div><section className="admin-card table-card"><div className="card-title"><div><Heart/><span><strong>Mais procurados</strong><small>Manifestações registradas pelo botão Tenho interesse</small></span></div></div><div className="responsive-table"><table><thead><tr><th>Produto</th><th>Configuração</th><th>Situação</th><th>Interesses</th></tr></thead><tbody>{rows.map((row)=><tr key={`${row.name}-${row.configuration}-${row.status}`}><td><strong>{row.name}</strong></td><td>{row.configuration||"—"}</td><td>{row.status==="coming_soon"?"Em breve":"Aguardando reposição"}</td><td><strong>{row.count}</strong></td></tr>)}{rows.length===0&&<tr><td colSpan={4}>Ainda não há manifestações registradas.</td></tr>}</tbody></table></div></section></>;
}
