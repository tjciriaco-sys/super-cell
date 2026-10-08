-- Controle comercial no nível da variante/cor.
-- O status do produto passa a resumir automaticamente os status das variantes ativas.

alter table public.product_variants
  add column if not exists commercial_status text not null default 'available';

alter table public.product_variants
  drop constraint if exists product_variants_commercial_status_check;

alter table public.product_variants
  add constraint product_variants_commercial_status_check
  check (commercial_status = any (array['available'::text,'restocking'::text,'hidden'::text]));

update public.product_variants v
set commercial_status = case
  when p.commercial_status='coming_soon' then 'hidden'
  when p.commercial_status='restocking' then 'restocking'
  when exists (
    select 1
    from public.supplier_offers o
    join public.suppliers s on s.id=o.supplier_id and s.active
    where o.variant_id=v.id and o.available and o.cost>0
  ) then 'available'
  else 'restocking'
end
from public.products p
where p.id=v.product_id;

create or replace function internal.sync_product_status_from_variants()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
  affected_product uuid;
  next_status text;
begin
  affected_product := coalesce(new.product_id, old.product_id);
  if affected_product is null then return null; end if;

  select case
    when exists (
      select 1 from public.product_variants v
      where v.product_id=affected_product and v.active and v.commercial_status='available'
    ) then 'available'
    when exists (
      select 1 from public.product_variants v
      where v.product_id=affected_product and v.active and v.commercial_status='restocking'
    ) then 'restocking'
    else 'coming_soon'
  end into next_status;

  update public.products
  set commercial_status=next_status,updated_at=now()
  where id=affected_product and commercial_status is distinct from next_status;

  return null;
end;
$function$;

drop trigger if exists sync_product_status_from_variants on public.product_variants;
create trigger sync_product_status_from_variants
after insert or delete or update of commercial_status,active
on public.product_variants
for each row execute function internal.sync_product_status_from_variants();

create or replace function internal.sync_product_commercial_status()
returns trigger
language plpgsql
security definer
set search_path=''
as $function$
declare
  affected_variant uuid;
  current_status text;
  has_valid_offer boolean;
begin
  affected_variant := coalesce(new.variant_id,old.variant_id);
  if affected_variant is null then return null; end if;

  select v.commercial_status into current_status
  from public.product_variants v
  where v.id=affected_variant;

  if current_status is null or current_status='hidden' then return null; end if;

  select exists(
    select 1
    from public.supplier_offers o
    join public.suppliers s on s.id=o.supplier_id and s.active
    where o.variant_id=affected_variant and o.available and o.cost>0
  ) into has_valid_offer;

  update public.product_variants
  set commercial_status=case when has_valid_offer then 'available' else 'restocking' end,
      updated_at=now()
  where id=affected_variant
    and commercial_status is distinct from case when has_valid_offer then 'available' else 'restocking' end;

  return null;
end;
$function$;

create or replace function internal.validate_product_for_publication()
returns trigger
language plpgsql
set search_path=''
as $function$
declare
  active_variants integer;
  available_variants integer;
  missing_offers integer;
  color_count integer;
  missing_images integer;
  distinct_variant_images integer;
begin
  if new.catalog_status <> 'ready' then return new; end if;

  if tg_op='UPDATE' and old.catalog_status='ready'
     and old.commercial_status=new.commercial_status
     and old.image_strategy=new.image_strategy
     and old.images=new.images then return new; end if;

  select count(*) into active_variants
  from public.product_variants v
  where v.product_id=new.id and v.active;

  if active_variants=0 then raise exception 'Produto sem variante ativa não pode ser publicado.'; end if;

  select count(*) into available_variants
  from public.product_variants v
  where v.product_id=new.id and v.active and v.commercial_status='available';

  if new.commercial_status='available' then
    if available_variants=0 then
      raise exception 'Produto disponível precisa de pelo menos uma variante disponível.';
    end if;

    select count(*) into missing_offers
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and not exists (
        select 1
        from public.supplier_offers o
        join public.suppliers s on s.id=o.supplier_id and s.active
        where o.variant_id=v.id and o.available and o.cost>0
      );

    if missing_offers>0 then raise exception 'Variante disponível exige oferta e custo válidos.'; end if;
  end if;

  if available_variants=0 then return new; end if;

  select count(distinct lower(trim(v.color))) filter(where v.color is not null)
  into color_count
  from public.product_variants v
  where v.product_id=new.id and v.active and v.commercial_status='available';

  if new.image_strategy='group' then
    if jsonb_typeof(new.images)<>'array' or jsonb_array_length(new.images)=0 then
      raise exception 'Produto com foto coletiva precisa de uma imagem geral.';
    end if;
  elsif color_count>1 then
    select count(*) filter(where jsonb_typeof(v.images)<>'array' or jsonb_array_length(v.images)=0),
           count(distinct v.images::text)
    into missing_images,distinct_variant_images
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and v.color is not null;

    if missing_images>0 or distinct_variant_images<color_count then
      raise exception 'Cada cor disponível precisa de uma imagem própria e diferente antes da publicação.';
    end if;
  elsif not exists(
    select 1
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and ((jsonb_typeof(v.images)='array' and jsonb_array_length(v.images)>0)
        or (jsonb_typeof(new.images)='array' and jsonb_array_length(new.images)>0))
  ) then
    raise exception 'Variante disponível sem imagem não pode ser publicada.';
  end if;

  return new;
end;
$function$;

create or replace function internal.refresh_public_catalog()
returns trigger
language plpgsql
security definer
set search_path=''
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
    p.video_url,p.badges,p.featured,priced.price_pix,chosen.supplier_code,true,
    v.commercial_status,p.storefront_image,now()
  from public.product_variants v
  join public.products p on p.id=v.product_id and p.active and p.catalog_status='ready' and p.commercial_status='available'
  join public.brands b on b.id=p.brand_id and b.active
  join public.categories c on c.id=p.category_id and c.active
  left join lateral(
    select o.cost,s.code supplier_code
    from public.supplier_offers o
    join public.suppliers s on s.id=o.supplier_id and s.active
    where o.variant_id=v.id and o.available and (v.source_mode='automatic' or o.supplier_id=v.pinned_supplier_id)
    order by o.cost,o.updated_at desc limit 1
  ) chosen on true
  left join lateral(
    select t.multiplier from public.accessory_pricing_tiers t
    where t.active and chosen.cost>=t.min_cost and chosen.cost<=t.max_cost
    order by t.sort_order limit 1
  ) at on c.pricing_mode='accessory'
  left join lateral(
    select t.fixed_markup from public.pricing_tiers t
    where t.active and chosen.cost>=t.min_cost and (t.max_cost is null or chosen.cost<=t.max_cost)
    order by t.sort_order limit 1
  ) st on c.pricing_mode='standard'
  left join lateral(
    select coalesce(
      v.manual_price,
      case
        when c.pricing_mode='perfumery' and chosen.cost is not null then internal.perfumery_pix_price(chosen.cost)
        when c.pricing_mode='accessory' and at.multiplier is not null then internal.round_accessory_price(chosen.cost*at.multiplier)
        when c.pricing_mode='standard' and st.fixed_markup is not null then chosen.cost+st.fixed_markup
      end
    ) price_pix
  ) priced on true
  where v.active and v.commercial_status='available' and priced.price_pix>0;

  return null;
end;
$function$;

revoke all on function internal.sync_product_status_from_variants() from public,anon,authenticated;
revoke all on function internal.sync_product_commercial_status() from public,anon,authenticated;
revoke all on function internal.validate_product_for_publication() from public,anon,authenticated;
revoke all on function internal.refresh_public_catalog() from public,anon,authenticated;

update public.product_variants set updated_at=now() where true;
