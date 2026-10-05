alter table public.products
  add column if not exists commercial_status text not null default 'available',
  add column if not exists storefront_image text;

alter table public.products drop constraint if exists products_commercial_status_check;
alter table public.products add constraint products_commercial_status_check
  check (commercial_status in ('available','coming_soon','restocking'));

comment on column public.products.commercial_status is
  'Estado comercial público: available, coming_soon ou restocking.';
comment on column public.products.storefront_image is
  'Capa exclusiva da vitrine; a galeria continua vindo das imagens da variante.';

create table if not exists public.product_interests (
  id bigint generated always as identity primary key,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  commercial_status text not null check (commercial_status in ('coming_soon','restocking')),
  origin text not null default 'product_page' check (char_length(origin) between 1 and 60),
  dedupe_key text not null check (char_length(dedupe_key) between 16 and 160),
  created_at timestamptz not null default now(),
  unique (product_id, variant_id, commercial_status, dedupe_key)
);
create index if not exists product_interests_demand_idx
  on public.product_interests(product_id, commercial_status, created_at desc);
alter table public.product_interests enable row level security;
revoke all on public.product_interests from public, anon, authenticated;
grant select on public.product_interests to authenticated;
create policy product_interests_admin_read on public.product_interests
  for select to authenticated using ((select internal.is_admin()));

create or replace function public.register_product_interest(
  requested_product_id uuid,
  requested_variant_id uuid,
  requested_status text,
  requested_origin text,
  requested_dedupe_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare inserted_count integer;
begin
  if requested_status not in ('coming_soon','restocking')
     or char_length(requested_origin) not between 1 and 60
     or requested_origin !~ '^[a-z0-9_:-]+$'
     or char_length(requested_dedupe_key) not between 16 and 160
     or requested_dedupe_key !~ '^[a-zA-Z0-9:_-]+$' then
    raise exception 'Manifestação de interesse inválida.';
  end if;

  if not exists (
    select 1 from public.products p
    where p.id = requested_product_id and p.active and p.catalog_status = 'ready'
      and p.commercial_status = requested_status
  ) then raise exception 'Produto não aceita interesse neste momento.'; end if;

  if requested_variant_id is not null and not exists (
    select 1 from public.product_variants v
    where v.id = requested_variant_id and v.product_id = requested_product_id and v.active
  ) then raise exception 'Variante inválida.'; end if;

  insert into public.product_interests(product_id, variant_id, commercial_status, origin, dedupe_key)
  values(requested_product_id, requested_variant_id, requested_status, requested_origin, requested_dedupe_key)
  on conflict do nothing;
  get diagnostics inserted_count = row_count;
  return inserted_count > 0;
end;
$$;
revoke all on function public.register_product_interest(uuid,uuid,text,text,text) from public;
grant execute on function public.register_product_interest(uuid,uuid,text,text,text) to anon, authenticated;

alter table public.public_catalog
  alter column price_pix drop not null,
  add column if not exists commercial_status text not null default 'available',
  add column if not exists storefront_image text;

create or replace function internal.validate_product_for_publication()
returns trigger language plpgsql set search_path = '' as $$
declare active_variants integer; missing_offers integer; color_count integer;
  missing_images integer; distinct_variant_images integer; colored_variants integer;
begin
  if new.catalog_status <> 'ready' then return new; end if;
  if tg_op = 'UPDATE' and old.catalog_status = 'ready'
     and old.commercial_status = new.commercial_status
     and old.image_strategy = new.image_strategy
     and old.images = new.images then return new; end if;

  select count(*) into active_variants from public.product_variants v
  where v.product_id = new.id and v.active;
  if active_variants = 0 then raise exception 'Produto sem variante ativa não pode ser publicado.'; end if;

  if new.commercial_status = 'available' then
    select count(*) into missing_offers from public.product_variants v
    where v.product_id = new.id and v.active and not exists (
      select 1 from public.supplier_offers o join public.suppliers s on s.id=o.supplier_id and s.active
      where o.variant_id=v.id and o.available and o.cost>0);
    if missing_offers > 0 then raise exception 'Produto disponível exige oferta e custo válidos em todas as variantes.'; end if;
  end if;

  select count(distinct lower(trim(v.color))) filter(where v.color is not null),
         count(*) filter(where v.color is not null)
  into color_count,colored_variants from public.product_variants v where v.product_id=new.id and v.active;

  if new.image_strategy='group' then
    if jsonb_typeof(new.images)<>'array' or jsonb_array_length(new.images)=0 then
      raise exception 'Produto com foto coletiva precisa de uma imagem geral.'; end if;
  elsif color_count>1 then
    select count(*) filter(where jsonb_typeof(v.images)<>'array' or jsonb_array_length(v.images)=0),
           count(distinct v.images::text)
    into missing_images,distinct_variant_images from public.product_variants v
    where v.product_id=new.id and v.active and v.color is not null;
    if missing_images>0 or distinct_variant_images<color_count then
      raise exception 'Cada cor precisa de uma imagem própria e diferente antes da publicação.'; end if;
  elsif not exists(select 1 from public.product_variants v where v.product_id=new.id and v.active
    and ((jsonb_typeof(v.images)='array' and jsonb_array_length(v.images)>0)
      or (jsonb_typeof(new.images)='array' and jsonb_array_length(new.images)>0))) then
    raise exception 'Produto sem imagem não pode ser publicado.';
  end if;
  return new;
end; $$;

drop trigger if exists validate_product_for_publication on public.products;
create trigger validate_product_for_publication
  before insert or update of catalog_status, commercial_status, image_strategy, images on public.products
  for each row execute function internal.validate_product_for_publication();

create or replace function internal.sync_product_commercial_status()
returns trigger language plpgsql security definer set search_path='' as $$
declare affected_product uuid; has_any_offer boolean; all_variants_have_offer boolean; current_status text;
begin
  select v.product_id into affected_product from public.product_variants v
  where v.id=coalesce(new.variant_id,old.variant_id);
  if affected_product is null then return null; end if;
  select p.commercial_status into current_status from public.products p where p.id=affected_product;
  select exists(select 1 from public.product_variants v join public.supplier_offers o on o.variant_id=v.id
    join public.suppliers s on s.id=o.supplier_id and s.active
    where v.product_id=affected_product and v.active and o.available and o.cost>0) into has_any_offer;
  select not exists (
    select 1
    from public.product_variants v
    where v.product_id=affected_product
      and v.active
      and not exists (
        select 1
        from public.supplier_offers o
        join public.suppliers s on s.id=o.supplier_id and s.active
        where o.variant_id=v.id and o.available and o.cost>0
      )
  ) into all_variants_have_offer;
  if has_any_offer and all_variants_have_offer and current_status in ('coming_soon','restocking') then
    update public.products set commercial_status='available',updated_at=now() where id=affected_product;
  elsif not has_any_offer and current_status='available' then
    update public.products set commercial_status='restocking',updated_at=now() where id=affected_product;
  end if;
  return null;
end; $$;
revoke all on function internal.sync_product_commercial_status() from public,anon,authenticated;
drop trigger if exists sync_commercial_status_from_offers on public.supplier_offers;
create trigger sync_commercial_status_from_offers after insert or update or delete on public.supplier_offers
  for each row execute function internal.sync_product_commercial_status();

create or replace function internal.refresh_public_catalog()
returns trigger language plpgsql security definer set search_path='' as $$
begin
  delete from public.public_catalog;
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
end; $$;
revoke all on function internal.refresh_public_catalog() from public,anon,authenticated;

update public.products set updated_at=now() where id=(select id from public.products order by id limit 1);

-- Four visual pilots only. Existing commercial data is preserved.
update public.products
set storefront_image=case slug
  when 'iphone-17-pro' then '/products/iphone-17-pro.webp'
  when 'poco-f8-pro-5g-nfc' then '/products/poco-f8-pro-5g-nfc.webp'
end,updated_at=now()
where slug in ('iphone-17-pro','poco-f8-pro-5g-nfc');

insert into public.products(brand_id,category_id,name,slug,model,connectivity,condition,description,
  highlights,specifications,images,badges,active,featured,catalog_status,commercial_status,image_strategy,storefront_image)
select b.id,c.id,'POCO C85','poco-c85','C85','4G','novo',
  'Produto real do portfólio planejado Super Cell. Oferta e preço ainda não confirmados.',
  '{}'::jsonb,'{}'::jsonb,'[]'::jsonb,array['Em breve'],true,false,'draft','coming_soon','variant','/products/pilots/poco-c85-cover.webp'
from public.brands b,public.categories c where b.slug='poco' and c.slug='smartphones'
on conflict(slug) do update set commercial_status='coming_soon',storefront_image=excluded.storefront_image,
  image_strategy='variant',updated_at=now();

insert into public.products(brand_id,category_id,name,slug,model,connectivity,condition,description,
  highlights,specifications,images,badges,active,featured,catalog_status,commercial_status,image_strategy,storefront_image)
select b.id,c.id,'REDMI A7 Pro','redmi-a7-pro','A7 Pro','4G','novo',
  'Produto real do portfólio planejado Super Cell. Oferta e preço ainda não confirmados.',
  '{}'::jsonb,'{}'::jsonb,'[]'::jsonb,array['Em breve'],true,false,'draft','coming_soon','variant','/products/pilots/redmi-a7-pro-cover.webp'
from public.brands b,public.categories c where b.slug='redmi' and c.slug='smartphones'
on conflict(slug) do update set commercial_status='coming_soon',storefront_image=excluded.storefront_image,
  image_strategy='variant',updated_at=now();

insert into public.product_variants(product_id,sku,ram_gb,storage_gb,color,color_hex,images,active)
select p.id,'PCC85-6-128-'||x.code,6,128,x.color,x.hex,jsonb_build_array(x.image),true
from public.products p cross join (values
 ('PT','Preto','#242424','/products/pilots/poco-c85-black-gallery.webp'),
 ('RX','Roxo','#AAA2DC','/products/pilots/poco-c85-purple-gallery.webp'),
 ('VD','Verde','#71AAA4','/products/pilots/poco-c85-green-gallery.webp')) x(code,color,hex,image)
where p.slug='poco-c85' on conflict(product_id,ram_gb,storage_gb,color,condition_grade) do update set color_hex=excluded.color_hex,images=excluded.images,active=true,updated_at=now();
insert into public.product_variants(product_id,sku,ram_gb,storage_gb,color,color_hex,images,active)
select p.id,'PCC85-8-256-'||x.code,8,256,x.color,x.hex,jsonb_build_array(x.image),true
from public.products p cross join (values
 ('PT','Preto','#242424','/products/pilots/poco-c85-black-gallery.webp'),
 ('RX','Roxo','#AAA2DC','/products/pilots/poco-c85-purple-gallery.webp'),
 ('VD','Verde','#71AAA4','/products/pilots/poco-c85-green-gallery.webp')) x(code,color,hex,image)
where p.slug='poco-c85' on conflict(product_id,ram_gb,storage_gb,color,condition_grade) do update set color_hex=excluded.color_hex,images=excluded.images,active=true,updated_at=now();

insert into public.product_variants(product_id,sku,ram_gb,storage_gb,color,color_hex,images,active)
select p.id,'RDA7P-3-64-'||x.code,3,64,x.color,x.hex,jsonb_build_array(x.image),true
from public.products p cross join (values
 ('PT','Preto','#38393B','/products/pilots/redmi-a7-pro-black.webp'),
 ('AN','Azul Névoa','#B9D7E5','/products/pilots/redmi-a7-pro-mist-blue.webp'),
 ('VP','Verde Palma','#B6CB79','/products/pilots/redmi-a7-pro-palm-green.webp'),
 ('LP','Laranja Pôr do Sol','#E39761','/products/pilots/redmi-a7-pro-sunset-orange.webp')) x(code,color,hex,image)
where p.slug='redmi-a7-pro' on conflict(product_id,ram_gb,storage_gb,color,condition_grade) do update set color_hex=excluded.color_hex,images=excluded.images,active=true,updated_at=now();
insert into public.product_variants(product_id,sku,ram_gb,storage_gb,color,color_hex,images,active)
select p.id,'RDA7P-4-128-'||x.code,4,128,x.color,x.hex,jsonb_build_array(x.image),true
from public.products p cross join (values
 ('PT','Preto','#38393B','/products/pilots/redmi-a7-pro-black.webp'),
 ('AN','Azul Névoa','#B9D7E5','/products/pilots/redmi-a7-pro-mist-blue.webp'),
 ('VP','Verde Palma','#B6CB79','/products/pilots/redmi-a7-pro-palm-green.webp'),
 ('LP','Laranja Pôr do Sol','#E39761','/products/pilots/redmi-a7-pro-sunset-orange.webp')) x(code,color,hex,image)
where p.slug='redmi-a7-pro' on conflict(product_id,ram_gb,storage_gb,color,condition_grade) do update set color_hex=excluded.color_hex,images=excluded.images,active=true,updated_at=now();

update public.products set catalog_status='ready',updated_at=now()
where slug in ('poco-c85','redmi-a7-pro');
