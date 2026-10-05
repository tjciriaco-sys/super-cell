alter table public.categories
  add column if not exists pricing_mode text not null default 'standard'
  check (pricing_mode in ('standard', 'accessory'));

create table public.accessory_pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  min_cost numeric(12,2) not null,
  max_cost numeric(12,2) not null,
  multiplier numeric(8,4) not null check (multiplier > 1),
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint accessory_pricing_valid_range check (max_cost >= min_cost)
);

alter table public.accessory_pricing_tiers enable row level security;
revoke all on public.accessory_pricing_tiers from anon, authenticated;
grant select, insert, update, delete on public.accessory_pricing_tiers to authenticated;
create policy admin_all_accessory_pricing_tiers on public.accessory_pricing_tiers
  for all to authenticated
  using ((select internal.is_admin()))
  with check ((select internal.is_admin()));

insert into public.accessory_pricing_tiers (min_cost, max_cost, multiplier, sort_order)
values
  (0, 20, 2.20, 1),
  (20.01, 50, 1.65, 2),
  (50.01, 100, 1.50, 3),
  (100.01, 200, 1.40, 4);

create trigger audit_accessory_pricing_tiers
  after insert or update or delete on public.accessory_pricing_tiers
  for each row execute function internal.audit_change();

create or replace function internal.round_accessory_price(value numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select ceil(value / 5) * 5 - 0.10;
$$;

revoke all on function internal.round_accessory_price(numeric) from public, anon, authenticated;

update public.categories
set pricing_mode = 'accessory', updated_at = now()
where slug in ('cabos', 'carregadores', 'fones-de-ouvido', 'power-banks');

insert into public.commercial_settings (key, value, public, description)
values
  ('accessory_delivery_fee', '15', true, 'Taxa de entrega para acessórios abaixo do mínimo'),
  ('accessory_free_delivery_threshold', '100', true, 'Valor mínimo de acessórios para entrega grátis'),
  ('accessory_free_with_device', 'true', true, 'Entrega grátis quando o acessório acompanha um aparelho')
on conflict (key) do update set
  value = excluded.value,
  public = excluded.public,
  description = excluded.description,
  updated_at = now();

update public.product_variants
set manual_price = case sku
    when 'F3-K-M10' then 34.90
    when 'F3-CAR-0094' then 49.90
    when 'F3-BA-FON226' then 159.90
    else manual_price
  end,
  manual_price_reason = 'Preço competitivo aprovado para acessórios',
  manual_price_started_at = now(),
  updated_at = now()
where sku in ('F3-K-M10', 'F3-CAR-0094', 'F3-BA-FON226');

alter table public.public_catalog
  add column if not exists pricing_mode text not null default 'standard';

create or replace function internal.refresh_public_catalog()
returns trigger language plpgsql security definer
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
    price_pix, available, updated_at
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
    p.video_url, p.badges, p.featured, priced.price_pix, true, now()
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

revoke all on function internal.refresh_public_catalog() from public, anon, authenticated;

create trigger refresh_catalog_accessory_tiers
  after insert or update or delete on public.accessory_pricing_tiers
  for each statement execute function internal.refresh_public_catalog();

update public.categories set updated_at = now() where slug = 'cabos';
