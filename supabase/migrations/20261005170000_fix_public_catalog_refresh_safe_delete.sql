create or replace function internal.refresh_public_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  delete from public.public_catalog where true;

  insert into public.public_catalog (
    variant_id, product_id, slug, product_name, model, brand_name, brand_slug,
    category_name, category_slug, pricing_mode, condition, condition_grade, connectivity,
    ram_gb, storage_gb, color, color_hex, sim_configuration, battery_minimum, battery_health_minimum,
    original_components, never_opened, warranty_months, condition_details, description, highlights,
    specifications, images, video_url, badges, featured, price_pix, supplier_code, available,
    commercial_status, storefront_image, updated_at)
  select v.id,p.id,p.slug,p.name,p.model,b.name,b.slug,c.name,c.slug,c.pricing_mode,p.condition,
    v.condition_grade,p.connectivity,v.ram_gb,v.storage_gb,v.color,v.color_hex,
    coalesce(v.sim_configuration,p.sim_configuration),p.battery_minimum,
    coalesce(v.battery_health_minimum,p.battery_minimum),v.original_components,v.never_opened,
    v.warranty_months,v.condition_details,p.description,p.highlights,p.specifications,
    case when jsonb_typeof(v.images)='array' and jsonb_array_length(v.images)>0 then v.images else p.images end,
    p.video_url,p.badges,p.featured,
    case when p.commercial_status='available' then priced.price_pix end,
    case when p.commercial_status='available' then chosen.supplier_code end,
    p.commercial_status='available' and priced.price_pix>0,p.commercial_status,p.storefront_image,now()
  from public.product_variants v
  join public.products p on p.id=v.product_id and p.active and p.catalog_status='ready'
  join public.brands b on b.id=p.brand_id and b.active
  join public.categories c on c.id=p.category_id and c.active
  left join lateral(select o.cost,s.code supplier_code from public.supplier_offers o
    join public.suppliers s on s.id=o.supplier_id and s.active
    where o.variant_id=v.id and o.available and (v.source_mode='automatic' or o.supplier_id=v.pinned_supplier_id)
    order by o.cost,o.updated_at desc limit 1) chosen on true
  left join lateral(select t.multiplier from public.accessory_pricing_tiers t where t.active
    and chosen.cost>=t.min_cost and chosen.cost<=t.max_cost order by t.sort_order limit 1) at on c.pricing_mode='accessory'
  left join lateral(select t.fixed_markup from public.pricing_tiers t where t.active
    and chosen.cost>=t.min_cost and (t.max_cost is null or chosen.cost<=t.max_cost)
    order by t.sort_order limit 1) st on true
  left join lateral(select coalesce(v.manual_price,case when c.pricing_mode='accessory' and at.multiplier is not null
    then internal.round_accessory_price(chosen.cost*at.multiplier) when st.fixed_markup is not null
    then chosen.cost+st.fixed_markup end) price_pix) priced on true
  where v.active and (p.commercial_status<>'available' or priced.price_pix>0);

  return null;
end;
$function$;
