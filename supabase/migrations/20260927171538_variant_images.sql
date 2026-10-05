alter table public.product_variants
  add column if not exists images jsonb not null default '[]'::jsonb;

create or replace function internal.refresh_public_catalog()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  delete from public.public_catalog;
  insert into public.public_catalog (
    variant_id, product_id, slug, product_name, model, brand_name, brand_slug,
    category_name, category_slug, condition, condition_grade, connectivity, ram_gb, storage_gb,
    color, sim_configuration, battery_minimum, battery_health_minimum,
    original_components, never_opened, warranty_months, condition_details,
    description, highlights, specifications, images, video_url, badges, featured,
    price_pix, available, updated_at
  )
  select
    v.id, p.id, p.slug, p.name, p.model, b.name, b.slug,
    c.name, c.slug, p.condition, v.condition_grade, p.connectivity, v.ram_gb, v.storage_gb,
    v.color, coalesce(v.sim_configuration, p.sim_configuration), p.battery_minimum,
    coalesce(v.battery_health_minimum, p.battery_minimum), v.original_components,
    v.never_opened, v.warranty_months, v.condition_details,
    p.description, p.highlights, p.specifications,
    case
      when jsonb_typeof(v.images) = 'array' and jsonb_array_length(v.images) > 0 then v.images
      else p.images
    end,
    p.video_url, p.badges, p.featured,
    coalesce(v.manual_price, chosen.cost + tier.fixed_markup), true, now()
  from public.product_variants v
  join public.products p on p.id = v.product_id and p.active
  join public.brands b on b.id = p.brand_id and b.active
  join public.categories c on c.id = p.category_id and c.active
  join lateral (
    select o.cost
    from public.supplier_offers o
    join public.suppliers s on s.id = o.supplier_id and s.active
    where o.variant_id = v.id and o.available
      and (v.source_mode = 'automatic' or o.supplier_id = v.pinned_supplier_id)
    order by o.cost asc, o.updated_at desc
    limit 1
  ) chosen on true
  join lateral (
    select t.fixed_markup
    from public.pricing_tiers t
    where t.active and chosen.cost >= t.min_cost
      and (t.max_cost is null or chosen.cost <= t.max_cost)
    order by t.sort_order
    limit 1
  ) tier on true
  where v.active and coalesce(v.manual_price, chosen.cost + tier.fixed_markup) > 0;
  return null;
end;
$$;

revoke all on function internal.refresh_public_catalog() from public, anon, authenticated;

update public.product_variants v
set images = case lower(v.color)
  when 'azul' then '["/products/iphone-13-blue.webp"]'::jsonb
  when 'preto' then '["/products/iphone-13-midnight.webp"]'::jsonb
  when 'rosa' then '["/products/iphone-13-pink.webp"]'::jsonb
  else v.images
end,
updated_at = now()
from public.products p
where v.product_id = p.id
  and p.slug = 'iphone-13-seminovo'
  and lower(v.color) in ('azul','preto','rosa');
