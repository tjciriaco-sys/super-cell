alter table public.products
  add column if not exists catalog_status text not null default 'ready';

alter table public.products
  alter column catalog_status set default 'draft';

alter table public.products
  drop constraint if exists products_catalog_status_check;

alter table public.products
  add constraint products_catalog_status_check
  check (catalog_status in ('draft', 'ready'));

comment on column public.products.catalog_status is
  'Novos produtos nascem como draft e só entram na vitrine após QA e promoção explícita para ready.';

alter table public.product_variants
  add column if not exists color_hex text;

alter table public.product_variants
  drop constraint if exists product_variants_color_hex_check;

alter table public.product_variants
  add constraint product_variants_color_hex_check
  check (color_hex is null or color_hex ~ '^#[0-9A-Fa-f]{6}$');

alter table public.public_catalog
  add column if not exists color_hex text;

update public.product_variants
set images = case sku
    when 'IP13P-128-AZ' then '["/products/iphone-13-pro-azul.webp"]'::jsonb
    when 'IP13P-128-BR' then '["/products/iphone-13-pro-branco.webp"]'::jsonb
    when 'IP13P-128-CZ' then '["/products/iphone-13-pro-cinza.webp"]'::jsonb
    when 'IP15-128-VD' then '["/products/iphone-15-verde.webp"]'::jsonb
    when 'IP15-128-AZ' then '["/products/iphone-15-azul.webp"]'::jsonb
    when 'IP15-128-ROSA' then '["/products/iphone-15-rosa.webp"]'::jsonb
    else images
  end,
  color_hex = case sku
    when 'IP13P-128-AZ' then '#8FAEC7'
    when 'IP13P-128-BR' then '#E9E7E1'
    when 'IP13P-128-CZ' then '#55575A'
    when 'IP15-128-VD' then '#D5E3D1'
    when 'IP15-128-AZ' then '#C7D7E8'
    when 'IP15-128-ROSA' then '#E8BBC3'
    else color_hex
  end,
  updated_at = now()
where sku in ('IP13P-128-AZ','IP13P-128-BR','IP13P-128-CZ','IP15-128-VD','IP15-128-AZ','IP15-128-ROSA');

update public.products
set image_strategy = 'group', updated_at = now()
where slug in ('poco-c71','poco-f8-pro-5g-nfc');

create or replace function internal.apply_used_iphone_defaults()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  is_used_iphone boolean;
begin
  select p.condition = 'seminovo' and b.slug = 'apple'
  into is_used_iphone
  from public.products p
  join public.brands b on b.id = p.brand_id
  where p.id = new.product_id;

  if coalesce(is_used_iphone, false) then
    new.condition_grade := coalesce(new.condition_grade, 'excelente');
    new.battery_health_minimum := coalesce(new.battery_health_minimum, 85);
    new.warranty_months := greatest(coalesce(new.warranty_months, 3), 3);
  end if;

  return new;
end;
$$;

drop trigger if exists apply_used_iphone_defaults on public.product_variants;
create trigger apply_used_iphone_defaults
  before insert or update of product_id on public.product_variants
  for each row execute function internal.apply_used_iphone_defaults();

create or replace function internal.validate_product_for_publication()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  active_variants integer;
  missing_offers integer;
  color_count integer;
  missing_images integer;
  distinct_variant_images integer;
  colored_variants integer;
begin
  if new.catalog_status <> 'ready' or old.catalog_status = 'ready' then
    return new;
  end if;

  select count(*) into active_variants
  from public.product_variants v
  where v.product_id = new.id and v.active;

  if active_variants = 0 then
    raise exception 'Produto sem variante ativa não pode ser publicado.';
  end if;

  select count(*) into missing_offers
  from public.product_variants v
  where v.product_id = new.id and v.active
    and not exists (
      select 1 from public.supplier_offers o
      join public.suppliers s on s.id = o.supplier_id and s.active
      where o.variant_id = v.id and o.available and o.cost > 0
    );

  if missing_offers > 0 then
    raise exception 'Todas as variantes ativas precisam de oferta disponível e custo válido.';
  end if;

  select count(distinct lower(trim(v.color))) filter (where v.color is not null),
         count(*) filter (where v.color is not null)
  into color_count, colored_variants
  from public.product_variants v
  where v.product_id = new.id and v.active;

  if new.image_strategy = 'group' then
    if jsonb_typeof(new.images) <> 'array' or jsonb_array_length(new.images) = 0 then
      raise exception 'Produto com foto coletiva precisa de uma imagem geral.';
    end if;
  elsif color_count > 1 then
    select count(*) filter (where jsonb_typeof(v.images) <> 'array' or jsonb_array_length(v.images) = 0),
           count(distinct v.images::text)
    into missing_images, distinct_variant_images
    from public.product_variants v
    where v.product_id = new.id and v.active and v.color is not null;

    if missing_images > 0 or distinct_variant_images < colored_variants then
      raise exception 'Cada cor precisa de uma imagem própria e diferente antes da publicação.';
    end if;
  elsif not exists (
    select 1 from public.product_variants v
    where v.product_id = new.id and v.active
      and ((jsonb_typeof(v.images) = 'array' and jsonb_array_length(v.images) > 0)
        or (jsonb_typeof(new.images) = 'array' and jsonb_array_length(new.images) > 0))
  ) then
    raise exception 'Produto sem imagem não pode ser publicado.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_product_for_publication on public.products;
create trigger validate_product_for_publication
  before update of catalog_status on public.products
  for each row execute function internal.validate_product_for_publication();

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
    ram_gb, storage_gb, color, color_hex, sim_configuration, battery_minimum, battery_health_minimum,
    original_components, never_opened, warranty_months, condition_details,
    description, highlights, specifications, images, video_url, badges, featured,
    price_pix, supplier_code, available, updated_at
  )
  select
    v.id, p.id, p.slug, p.name, p.model, b.name, b.slug,
    c.name, c.slug, c.pricing_mode, p.condition, v.condition_grade, p.connectivity,
    v.ram_gb, v.storage_gb, v.color, v.color_hex, coalesce(v.sim_configuration, p.sim_configuration),
    p.battery_minimum, coalesce(v.battery_health_minimum, p.battery_minimum),
    v.original_components, v.never_opened, v.warranty_months, v.condition_details,
    p.description, p.highlights, p.specifications,
    case
      when jsonb_typeof(v.images) = 'array' and jsonb_array_length(v.images) > 0 then v.images
      else p.images
    end,
    p.video_url, p.badges, p.featured, priced.price_pix, chosen.supplier_code, true, now()
  from public.product_variants v
  join public.products p on p.id = v.product_id and p.active and p.catalog_status = 'ready'
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

revoke all on function internal.refresh_public_catalog() from public, anon, authenticated;

update public.products set updated_at = now() where id = (select id from public.products order by id limit 1);
