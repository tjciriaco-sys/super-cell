alter table public.product_variants
  add column condition_grade text
  check (condition_grade is null or condition_grade in ('bom', 'muito_bom', 'excelente'));

alter table public.product_variants
  drop constraint product_variants_product_id_ram_gb_storage_gb_color_key;

alter table public.product_variants
  add constraint product_variants_configuration_grade_key
  unique nulls not distinct (product_id, ram_gb, storage_gb, color, condition_grade);

alter table public.public_catalog
  add column condition_grade text;

create or replace function internal.refresh_public_catalog()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  delete from public.public_catalog;
  insert into public.public_catalog (
    variant_id, product_id, slug, product_name, model, brand_name, brand_slug,
    category_name, category_slug, condition, condition_grade, connectivity, ram_gb, storage_gb,
    color, sim_configuration, battery_minimum, description, highlights,
    specifications, images, video_url, badges, featured, price_pix, available, updated_at
  )
  select
    v.id, p.id, p.slug, p.name, p.model, b.name, b.slug,
    c.name, c.slug, p.condition, v.condition_grade, p.connectivity, v.ram_gb, v.storage_gb,
    v.color, coalesce(v.sim_configuration, p.sim_configuration), p.battery_minimum,
    p.description, p.highlights, p.specifications, p.images, p.video_url,
    p.badges, p.featured,
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
set condition_grade = 'excelente', updated_at = now()
from public.products p
join public.brands b on b.id = p.brand_id
where v.product_id = p.id
  and p.condition = 'seminovo'
  and b.slug = 'apple';

update public.products p
set
  battery_minimum = 85,
  description = 'iPhone seminovo em estado excelente, 100% funcional, com componentes originais e sem histórico de abertura. Bateria mínima de 85% e garantia Super Cell de 3 meses.',
  updated_at = now()
from public.brands b
where p.brand_id = b.id
  and b.slug = 'apple'
  and p.condition = 'seminovo';
