alter table public.public_catalog
  add column if not exists supplier_code text;

create or replace function internal.refresh_public_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.public_catalog;
  insert into public.public_catalog (
    variant_id, product_id, slug, product_name, model, brand_name, brand_slug,
    category_name, category_slug, pricing_mode, condition, condition_grade, connectivity,
    ram_gb, storage_gb, color, sim_configuration, battery_minimum, battery_health_minimum,
    original_components, never_opened, warranty_months, condition_details,
    description, highlights, specifications, images, video_url, badges, featured,
    price_pix, supplier_code, available, updated_at
  )
  select
    v.id, p.id, p.slug, p.name, p.model, b.name, b.slug,
    c.name, c.slug, c.pricing_mode, p.condition, v.condition_grade, p.connectivity,
    v.ram_gb, v.storage_gb, v.color, coalesce(v.sim_configuration, p.sim_configuration),
    p.battery_minimum, coalesce(v.battery_health_minimum, p.battery_minimum),
    v.original_components, v.never_opened, v.warranty_months, v.condition_details,
    p.description, p.highlights, p.specifications,
    case
      when jsonb_typeof(v.images) = 'array' and jsonb_array_length(v.images) > 0 then v.images
      else p.images
    end,
    p.video_url, p.badges, p.featured, priced.price_pix, chosen.supplier_code, true, now()
  from public.product_variants v
  join public.products p on p.id = v.product_id and p.active
  join public.brands b on b.id = p.brand_id and b.active
  join public.categories c on c.id = p.category_id and c.active
  join lateral (
    select o.cost, s.code as supplier_code
    from public.supplier_offers o
    join public.suppliers s on s.id = o.supplier_id and s.active
    where o.variant_id = v.id and o.available
      and (v.source_mode = 'automatic' or o.supplier_id = v.pinned_supplier_id)
    order by o.cost asc, o.updated_at desc
    limit 1
  ) chosen on true
  left join lateral (
    select t.multiplier
    from public.accessory_pricing_tiers t
    where t.active and chosen.cost >= t.min_cost and chosen.cost <= t.max_cost
    order by t.sort_order
    limit 1
  ) accessory_tier on c.pricing_mode = 'accessory'
  left join lateral (
    select t.fixed_markup
    from public.pricing_tiers t
    where t.active and chosen.cost >= t.min_cost
      and (t.max_cost is null or chosen.cost <= t.max_cost)
    order by t.sort_order
    limit 1
  ) standard_tier on true
  join lateral (
    select coalesce(
      v.manual_price,
      case
        when c.pricing_mode = 'accessory' and accessory_tier.multiplier is not null
          then internal.round_accessory_price(chosen.cost * accessory_tier.multiplier)
        else chosen.cost + standard_tier.fixed_markup
      end
    ) as price_pix
  ) priced on true
  where v.active and priced.price_pix > 0;
  return null;
end;
$$;

update public.product_variants
set updated_at = updated_at
where id = (select id from public.product_variants order by id limit 1);
