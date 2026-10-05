-- Controlled commercial load: F1 / Guanacel used iPhones received 2026-10-03.
-- Each supplier line is an independent commercial product. No stock quantity is
-- introduced; availability remains a supplier-offer boolean.

alter table public.product_variants alter column original_components drop not null;
alter table public.product_variants alter column original_components drop default;
alter table public.product_variants alter column never_opened drop not null;
alter table public.product_variants alter column never_opened drop default;
alter table public.product_variants alter column warranty_months drop not null;
alter table public.product_variants alter column warranty_months drop default;
alter table public.public_catalog alter column original_components drop not null;
alter table public.public_catalog alter column never_opened drop not null;
alter table public.public_catalog alter column warranty_months drop not null;

create or replace function internal.apply_used_iphone_defaults()
returns trigger
language plpgsql
set search_path=''
as $$
begin
  -- Battery, cosmetic grade, opening history, component originality and
  -- warranty are unit facts. They must never be inferred from one another.
  return new;
end;
$$;

create temporary table guanacel_iphones_20261003 (
  line_no integer primary key,
  model text not null,
  storage_gb integer not null,
  color text not null,
  color_hex text,
  cost numeric(12,2) not null,
  battery smallint,
  image_path text,
  publish_ready boolean not null
) on commit drop;

insert into guanacel_iphones_20261003 values
  (1,'iPhone 12',128,'Preto','#1F2020',1480,92,'/products/guanacel-20261003/iphone-12-preto-1-cor.webp',true),
  (2,'iPhone 12',128,'Preto','#1F2020',1460,86,'/products/guanacel-20261003/iphone-12-preto-1-cor.webp',true),
  (3,'iPhone 12 Pro',128,'Dourado','#F4E8CE',1730,90,'/products/guanacel-20261003/iphone-12-pro-dourado-1-cor.webp',true),
  (4,'iPhone 12 Pro',128,'Dourado','#F4E8CE',1730,91,'/products/guanacel-20261003/iphone-12-pro-dourado-1-cor.webp',true),
  (5,'iPhone 12 Pro',128,'Azul-Pacífico','#2E4755',1730,95,'/products/guanacel-20261003/iphone-12-pro-azul-pacifico-1-cor.webp',true),
  (6,'iPhone 12 Pro',128,'Azul-Pacífico','#2E4755',1730,91,'/products/guanacel-20261003/iphone-12-pro-azul-pacifico-1-cor.webp',true),
  (7,'iPhone 13',128,'Preto','#1F2120',1850,88,'/products/guanacel-20261003/iphone-13-preto-1-cor.webp',true),
  (8,'iPhone 13',128,'Preto','#1F2120',1850,87,'/products/guanacel-20261003/iphone-13-preto-1-cor.webp',true),
  (9,'iPhone 13 Pro',128,'Prateado','#E9E7E1',2380,92,'/products/guanacel-20261003/iphone-13-pro-prateado-1-cor.webp',true),
  (10,'iPhone 13 Pro',128,'Grafite','#55575A',2380,92,'/products/guanacel-20261003/iphone-13-pro-grafite-1-cor.webp',true),
  (11,'iPhone 13 Pro Max',128,'Verde','#435246',2600,76,'/products/guanacel-20261003/iphone-13-pro-max-verde-1-cor.webp',true),
  (12,'iPhone 14',128,'Azul','#A7C1D9',1970,93,'/products/guanacel-20261003/iphone-14-azul-1-cor.webp',true),
  (13,'iPhone 14 Pro Max',128,'Cor a confirmar (🧡)',null,3100,88,null,false),
  (14,'iPhone 14 Pro Max',256,'Roxo','#594F63',3270,90,'/products/guanacel-20261003/iphone-14-pro-max-roxo-1-cor.webp',true),
  (15,'iPhone 14 Pro Max',256,'Roxo','#594F63',3270,92,'/products/guanacel-20261003/iphone-14-pro-max-roxo-1-cor.webp',true),
  (16,'iPhone 15 Pro Max',512,'Cor a confirmar (💜)',null,3960,null,null,false);

-- The 2026-10-03 list is authoritative for every F1 iPhone, regardless of
-- condition. Historical rows are preserved and only availability/visibility
-- are changed.
update public.supplier_offers o
set available=false, updated_at=now()
from public.product_variants v
join public.products p on p.id=v.product_id
join public.brands b on b.id=p.brand_id
join public.categories c on c.id=p.category_id
where o.variant_id=v.id
  and o.supplier_id=(select id from public.suppliers where code='F1')
  and o.available
  and b.slug='apple'
  and (c.slug='iphone' or p.model ilike 'iPhone%')
  and coalesce(o.external_code,'') not like 'F1-USED-20261003-%';

-- An old iPhone without any remaining active supplier offer is kept for
-- history but removed from the current storefront.
update public.products p
set catalog_status='draft', commercial_status='restocking', updated_at=now()
where p.id in (
  select distinct v.product_id
  from public.product_variants v
  join public.brands b on b.id=p.brand_id
  join public.categories c on c.id=p.category_id
  where v.product_id=p.id
    and b.slug='apple'
    and (c.slug='iphone' or p.model ilike 'iPhone%')
    and not exists (
      select 1
      from public.product_variants vx
      join public.supplier_offers ox on ox.variant_id=vx.id
      join public.suppliers sx on sx.id=ox.supplier_id
      where vx.product_id=p.id and vx.active and ox.available and sx.active
    )
)
and p.slug not like '%-f1-20261003-%';

insert into public.products (
  brand_id, category_id, name, slug, model, connectivity, condition,
  description, highlights, specifications, images, badges, battery_minimum,
  active, featured, published_at, image_strategy, catalog_status,
  commercial_status, storefront_image
)
select
  b.id, c.id,
  g.model || case when g.battery is null then ' · Bateria não informada' else ' · Bateria ' || g.battery || '%' end,
  lower(regexp_replace(g.model,'[^a-zA-Z0-9]+','-','g')) || '-seminovo-' || g.storage_gb || '-f1-20261003-' || lpad(g.line_no::text,2,'0'),
  g.model, '5G', 'seminovo',
  'Aparelho seminovo com disponibilidade informada pela Guanacel em 03/10/2026. Saúde da bateria informada individualmente quando disponível; demais detalhes da unidade são confirmados no WhatsApp.',
  jsonb_build_object('Armazenamento',g.storage_gb || ' GB','Cor',g.color,'Bateria',coalesce(g.battery::text || '%','Não informada')),
  '{}'::jsonb,
  case when g.image_path is null then '[]'::jsonb else jsonb_build_array(g.image_path) end,
  array['Seminovo']::text[], null, true, false,
  null,
  'variant', 'draft',
  'available', g.image_path
from guanacel_iphones_20261003 g
cross join public.brands b
cross join public.categories c
where b.slug='apple' and c.slug='iphone'
on conflict (slug) do update set
  name=excluded.name, model=excluded.model, connectivity=excluded.connectivity,
  description=excluded.description, highlights=excluded.highlights,
  images=excluded.images, badges=excluded.badges, battery_minimum=null,
  active=true, image_strategy=excluded.image_strategy,
  catalog_status=excluded.catalog_status, commercial_status='available',
  storefront_image=excluded.storefront_image, updated_at=now();

insert into public.product_variants (
  product_id, sku, storage_gb, color, color_hex, active, source_mode,
  condition_grade, battery_health_minimum, original_components, never_opened,
  warranty_months, condition_details, images
)
select
  p.id, 'F1-USED-20261003-' || lpad(g.line_no::text,3,'0'),
  g.storage_gb, g.color, g.color_hex, true, 'automatic',
  null, g.battery, null, null, null,
  'Estado de conservação, originalidade dos componentes, histórico de abertura e garantia não informados na lista do fornecedor.',
  case when g.image_path is null then '[]'::jsonb else jsonb_build_array(g.image_path) end
from guanacel_iphones_20261003 g
join public.products p on p.slug=lower(regexp_replace(g.model,'[^a-zA-Z0-9]+','-','g')) || '-seminovo-' || g.storage_gb || '-f1-20261003-' || lpad(g.line_no::text,2,'0')
on conflict (sku) do update set
  product_id=excluded.product_id, storage_gb=excluded.storage_gb,
  color=excluded.color, color_hex=excluded.color_hex, active=true,
  condition_grade=null, battery_health_minimum=excluded.battery_health_minimum,
  original_components=null, never_opened=null, warranty_months=null,
  condition_details=excluded.condition_details, images=excluded.images,
  updated_at=now();

insert into public.supplier_offers (
  supplier_id, variant_id, external_code, source_label, cost, available,
  source_updated_at, raw_data
)
select
  s.id, v.id, 'F1-USED-20261003-' || lpad(g.line_no::text,3,'0'),
  'Guanacel 03/10/2026', g.cost, true, '2026-10-03 12:00:00+00'::timestamptz,
  jsonb_build_object('list_date','2026-10-03','line',g.line_no,'battery',g.battery,'supplier_color',g.color)
from guanacel_iphones_20261003 g
join public.product_variants v on v.sku='F1-USED-20261003-' || lpad(g.line_no::text,3,'0')
join public.suppliers s on s.code='F1'
on conflict (supplier_id,variant_id,external_code) do update set
  source_label=excluded.source_label, cost=excluded.cost, available=true,
  source_updated_at=excluded.source_updated_at, raw_data=excluded.raw_data,
  updated_at=now();

update public.products p
set catalog_status='ready', published_at=coalesce(p.published_at,now()), updated_at=now()
from guanacel_iphones_20261003 g
where g.publish_ready
  and p.slug=lower(regexp_replace(g.model,'[^a-zA-Z0-9]+','-','g')) || '-seminovo-' || g.storage_gb || '-f1-20261003-' || lpad(g.line_no::text,2,'0');
