-- Guanacel / F1-A online catalog snapshot captured from the public supplier catalog on 2026-10-06.
-- Commit for homologation first. Apply only after Preview approval.
-- This sync never touches F1-B / used-iPhone offers.

create temporary table guanacel_online_20261006 (
  external_code text primary key,
  slug text not null,
  product_name text not null,
  model text not null,
  brand_slug text not null,
  category_slug text not null,
  connectivity text,
  ram_gb integer,
  storage_gb integer,
  color text,
  color_hex text,
  cost numeric(12,2) not null,
  supplier_stock integer,
  image_path text not null,
  storefront_image text not null,
  extra_highlights jsonb not null default '{}'::jsonb
) on commit drop;

insert into guanacel_online_20261006 values
('000015','multilaser-up-play-3g','Multilaser UP Play 3G','UP Play 3G','multilaser','smartphones','3G',null,null,null,null,120,22,'/products/guanacel-20261006/multilaser-up-play-3g.webp','/products/guanacel-20261006/multilaser-up-play-3g.webp','{}'),
('000060','xiaomi-pad-7','Xiaomi Pad 7','Pad 7','xiaomi','tablets',null,8,256,'Cinza','#777A7D',1990,1,'/products/guanacel-20261006/xiaomi-pad-7-8-256-cinza.webp','/products/guanacel-20261006/xiaomi-pad-7-8-256-cinza.webp','{}'),
('000003','iphone-17-pro','iPhone 17 Pro','iPhone 17 Pro','apple','iphone','5G',null,256,'Laranja','#D96F32',6950,1,'/products/guanacel-20261006/iphone-17-pro-256.webp','/products/guanacel-20261006/iphone-17-pro-256.webp','{}'),
('1000100','iphone-17-pro-max','iPhone 17 Pro Max','iPhone 17 Pro Max','apple','iphone','5G',null,256,'Azul','#477FB2',7450,1,'/products/guanacel-20261006/iphone-17-pro-max-256-azul.webp','/products/guanacel-20261006/iphone-17-pro-max-256-azul.webp','{}'),
('1000037','poco-c71','POCO C71','C71','poco','smartphones','4G',3,64,'Preto','#242424',680,8,'/products/guanacel-20261006/poco-c71-3-64-preto.webp','/products/guanacel-20261006/cover-poco-c71.webp','{}'),
('000137','poco-c71','POCO C71','C71','poco','smartphones','4G',3,64,'Azul','#A7C1D9',680,4,'/products/guanacel-20261006/poco-c71-3-64-azul.webp','/products/guanacel-20261006/cover-poco-c71.webp','{}'),
('1000038','poco-c71','POCO C71','C71','poco','smartphones','4G',4,128,'Preto','#242424',790,17,'/products/guanacel-20261006/poco-c71-4-128-preto.webp','/products/guanacel-20261006/cover-poco-c71.webp','{}'),
('1000050','poco-f8-pro-5g-nfc','POCO F8 Pro 5G NFC','F8 Pro','poco','smartphones','5G',12,512,'Azul','#477FB2',3400,2,'/products/guanacel-20261006/poco-f8-pro-12-512-azul.webp','/products/guanacel-20261006/cover-poco-f8-pro-5g-nfc.webp','{"NFC":"Sim"}'),
('000025','poco-f8-pro-5g-nfc','POCO F8 Pro 5G NFC','F8 Pro','poco','smartphones','5G',12,512,'Prata','#C8CBD0',3600,1,'/products/guanacel-20261006/poco-f8-pro-12-512-prata.webp','/products/guanacel-20261006/cover-poco-f8-pro-5g-nfc.webp','{"NFC":"Sim"}'),
('1000056','poco-f8-pro-5g-nfc','POCO F8 Pro 5G NFC','F8 Pro','poco','smartphones','5G',12,512,'Preto','#242424',3400,3,'/products/guanacel-20261006/poco-f8-pro-12-512-preto.webp','/products/guanacel-20261006/cover-poco-f8-pro-5g-nfc.webp','{"NFC":"Sim"}'),
('1000059','poco-m7-pro-5g','POCO M7 Pro 5G','M7 Pro','poco','smartphones','5G',6,128,'Preto','#242424',980,12,'/products/guanacel-20261006/poco-m7-pro-5g-6-128-preto.webp','/products/guanacel-20261006/poco-m7-pro-5g-6-128-preto.webp','{}'),
('000052','receptor-alphaplay-plus','Receptor Alphaplay Plus','ALPHAPLAY PLUS','alphaplay','receptores',null,null,null,null,null,450,51,'/products/guanacel-20261006/receptor-alphaplay-plus.webp','/products/guanacel-20261006/receptor-alphaplay-plus.webp','{}'),
('1000036','redmi-15c','REDMI 15C','15C','redmi','smartphones',null,16,256,'Preto','#242424',1000,17,'/products/guanacel-20261006/redmi-15c-16-256-preto-global.webp','/products/guanacel-20261006/redmi-15c-16-256-preto-global.webp','{"Versão":"Global"}'),
('000141','redmi-17','REDMI 17','17','redmi','smartphones',null,8,128,'Preto','#242424',1000,8,'/products/guanacel-20261006/redmi-17-8-128-preto.webp','/products/guanacel-20261006/redmi-17-8-128-preto.webp','{}'),
('1000048','redmi-a5','REDMI A5','A5','redmi','smartphones',null,4,128,'Preto','#242424',810,10,'/products/guanacel-20261006/redmi-a5-4-128-preto.webp','/products/guanacel-20261006/redmi-a5-4-128-preto.webp','{}'),
('1000051','redmi-a7-pro','REDMI A7 Pro','A7 Pro','redmi','smartphones',null,null,64,'Preto','#242424',720,5,'/products/guanacel-20261006/redmi-a7-pro-64-preto.webp','/products/guanacel-20261006/redmi-a7-pro-64-preto.webp','{}'),
('1000057','redmi-note-15-4g','REDMI Note 15 4G','Note 15','redmi','smartphones','4G',8,256,'Azul','#477FB2',1280,2,'/products/guanacel-20261006/redmi-note-15-4g-8-256-azul.webp','/products/guanacel-20261006/cover-redmi-note-15-4g.webp','{}'),
('000119','redmi-note-15-4g','REDMI Note 15 4G','Note 15','redmi','smartphones','4G',8,256,'Preto','#242424',1280,3,'/products/guanacel-20261006/redmi-note-15-4g-8-256-preto.webp','/products/guanacel-20261006/cover-redmi-note-15-4g.webp','{"NFC":"Identificado na opção preta pelo fornecedor"}'),
(';000007','redmi-pad-2','REDMI Pad 2','Pad 2','redmi','tablets',null,4,128,'Cinza','#777A7D',1130,2,'/products/guanacel-20261006/redmi-pad-2-4-128-cinza.webp','/products/guanacel-20261006/redmi-pad-2-4-128-cinza.webp','{}'),
('000132','redmi-pad-2','REDMI Pad 2','Pad 2','redmi','tablets',null,4,256,'Cinza','#777A7D',1250,2,'/products/guanacel-20261006/redmi-pad-2-4-256-cinza.webp','/products/guanacel-20261006/redmi-pad-2-4-128-cinza.webp','{}');

-- Retire only the prior F1-A online snapshot. F1-B and used iPhones are untouched.
update public.supplier_offers o
set available=false, updated_at=now()
where o.supplier_id=(select id from public.suppliers where code='F1')
  and (o.source_label ilike 'F1-A%' or o.source_label ilike 'Catálogo Guanacel%')
  and not exists (select 1 from guanacel_online_20261006 g where g.external_code=o.external_code);

-- Existing current products are temporarily draft while variants/offers/images are synchronized.
update public.products p
set catalog_status='draft', updated_at=now()
where p.slug in (select distinct slug from guanacel_online_20261006);

insert into public.products (
  brand_id,category_id,name,slug,model,connectivity,condition,description,
  highlights,specifications,images,badges,active,featured,image_strategy,
  catalog_status,commercial_status,storefront_image
)
select
  b.id,c.id,g.product_name,g.slug,g.model,g.connectivity,'novo',
  case when g.slug='redmi-note-15-4g'
    then 'Produto novo e lacrado. A listagem da Guanacel identifica a opção preta como NFC. Disponibilidade confirmada novamente no fechamento do pedido.'
    else 'Produto novo e lacrado com disponibilidade confirmada no catálogo online da Guanacel em 06/10/2026. Disponibilidade confirmada novamente no fechamento do pedido.'
  end,
  g.extra_highlights,'{}'::jsonb,jsonb_build_array(g.storefront_image),'{}'::text[],
  true,false,'variant','draft','available',g.storefront_image
from guanacel_online_20261006 g
join public.brands b on b.slug=g.brand_slug
join public.categories c on c.slug=g.category_slug
on conflict (slug) do update set
  brand_id=excluded.brand_id,category_id=excluded.category_id,name=excluded.name,
  model=excluded.model,connectivity=excluded.connectivity,condition='novo',
  description=excluded.description,highlights=excluded.highlights,
  images=excluded.images,badges=excluded.badges,active=true,image_strategy='variant',
  catalog_status='draft',commercial_status='available',
  storefront_image=excluded.storefront_image,updated_at=now();

-- Reuse an existing matching variant with NULL-safe comparison.
update public.product_variants v
set color_hex=g.color_hex,images=jsonb_build_array(g.image_path),active=true,
    source_mode='automatic',condition_grade=null,updated_at=now()
from guanacel_online_20261006 g
join public.products p on p.slug=g.slug
where v.product_id=p.id
  and v.ram_gb is not distinct from g.ram_gb
  and v.storage_gb is not distinct from g.storage_gb
  and v.color is not distinct from g.color;

insert into public.product_variants (
  product_id,sku,ram_gb,storage_gb,color,color_hex,images,active,source_mode,condition_grade
)
select
  p.id,
  'F1-A-20261006-' || regexp_replace(g.external_code,'[^A-Za-z0-9]+','','g'),
  g.ram_gb,g.storage_gb,g.color,g.color_hex,jsonb_build_array(g.image_path),
  true,'automatic',null
from guanacel_online_20261006 g
join public.products p on p.slug=g.slug
where not exists (
  select 1 from public.product_variants v
  where v.product_id=p.id
    and v.ram_gb is not distinct from g.ram_gb
    and v.storage_gb is not distinct from g.storage_gb
    and v.color is not distinct from g.color
);

-- Deactivate stale pilot variants only when no other active supplier still offers them.
update public.product_variants v
set active=false,updated_at=now()
from public.products p
where v.product_id=p.id
  and p.slug in (select distinct slug from guanacel_online_20261006)
  and not exists (
    select 1 from guanacel_online_20261006 g
    where g.slug=p.slug
      and v.ram_gb is not distinct from g.ram_gb
      and v.storage_gb is not distinct from g.storage_gb
      and v.color is not distinct from g.color
  )
  and not exists (
    select 1 from public.supplier_offers ox
    join public.suppliers sx on sx.id=ox.supplier_id
    where ox.variant_id=v.id and ox.available and sx.active
  );

insert into public.supplier_offers (
  supplier_id,variant_id,external_code,source_label,cost,available,source_updated_at,raw_data
)
select
  s.id,v.id,g.external_code,'F1-A · Catálogo online 06/10/2026',g.cost,true,now(),
  jsonb_build_object(
    'catalog_url','https://meucomercio.com.br/GUANACELL08',
    'catalog_date','2026-10-06',
    'supplier_stock',g.supplier_stock,
    'source','online_catalog'
  )
from guanacel_online_20261006 g
join public.products p on p.slug=g.slug
join public.product_variants v on v.product_id=p.id
  and v.ram_gb is not distinct from g.ram_gb
  and v.storage_gb is not distinct from g.storage_gb
  and v.color is not distinct from g.color
join public.suppliers s on s.code='F1'
on conflict (supplier_id,variant_id,external_code) do update set
  source_label=excluded.source_label,cost=excluded.cost,available=true,
  source_updated_at=excluded.source_updated_at,raw_data=excluded.raw_data,updated_at=now();

update public.suppliers
set source_url='https://meucomercio.com.br/GUANACELL08',last_updated_at=now(),updated_at=now()
where code='F1';

-- Publication is last, after every current variant has a real image and offer.
update public.products p
set catalog_status='ready',commercial_status='available',
    published_at=coalesce(p.published_at,now()),updated_at=now()
where p.slug in (select distinct slug from guanacel_online_20261006);
