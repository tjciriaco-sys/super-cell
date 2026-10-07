-- Guana Perfumes / PERFUME2026 — importação inicial via Firecrawl.
-- Fonte: https://meucomercio.com.br/PERFUME2026
-- Mantém a precificação standard da Super Cell (custo + acréscimo fixo por faixa).

insert into public.categories(name,slug,active,sort_order,pricing_mode)
values ('Perfumaria','perfumaria',true,30,'standard')
on conflict (slug) do update set name=excluded.name, active=true, pricing_mode='standard', updated_at=now();

insert into public.brands(name,slug,active)
values ('Guana Perfumes','guana-perfumes',true)
on conflict (slug) do update set name=excluded.name, active=true, updated_at=now();

insert into public.suppliers(code,name,active,source_type,source_url,notes,last_updated_at)
values ('F4','Guana Perfumes',true,'catalogo_online','https://meucomercio.com.br/PERFUME2026','Fonte extraída por Firecrawl a partir do catálogo público da Nextar.',now())
on conflict (code) do update set name=excluded.name, active=true, source_type=excluded.source_type, source_url=excluded.source_url, notes=excluded.notes, last_updated_at=now(), updated_at=now();

create temporary table tmp_perfume_import(
  code text primary key,
  product_name text not null,
  cost numeric not null,
  product_url text not null,
  image_url text not null,
  product_slug text not null unique
) on commit drop;

insert into tmp_perfume_import(code,product_name,cost,product_url,image_url,product_slug) values
  ('000007','AFEEF 100ML',430.00,'https://meucomercio.com.br/PERFUME2026/product/afeef-100ml/7','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/fceef8fb03542c68ae969dc1094a2615','perf-000007-afeef-100ml'),
  ('000019','AMEERAT AL ARAB 100ML',130.00,'https://meucomercio.com.br/PERFUME2026/product/ameerat-al-arab-100ml/19','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/ea4c9024d025be0e7bcb1fd489272a22','perf-000019-ameerat-al-arab-100ml'),
  ('000018','ANGEL ISABELLE LA BELLE 200ML',135.00,'https://meucomercio.com.br/PERFUME2026/product/angel-isabelle-la-belle-200ml/18','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f85d427d91c4a68580ad5e814966ad1c','perf-000018-angel-isabelle-la-belle-200ml'),
  ('000005','ASAD BLACK 100ML',190.00,'https://meucomercio.com.br/PERFUME2026/product/asad-black-100ml/5','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/2bb119bfa10842f895787001a589d807','perf-000005-asad-black-100ml'),
  ('000006','ASAD BOURBON 100ML',250.00,'https://meucomercio.com.br/PERFUME2026/product/asad-bourbon-100ml/6','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/6bc3093555cc8aca53c49a11d48723b6','perf-000006-asad-bourbon-100ml'),
  ('000001','ATHERI 100ML',360.00,'https://meucomercio.com.br/PERFUME2026/product/atheri-100ml/1','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/37933b750ea5951f624ab47e797affae','perf-000001-atheri-100ml'),
  ('000033','BADEE AL OUD BRANCO',160.00,'https://meucomercio.com.br/PERFUME2026/product/badee-al-oud-branco/33','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/52bea85efa2143855d1f7156b8dcd6f2','perf-000033-badee-al-oud-branco'),
  ('000037','BADEE AL OUD GLORY',160.00,'https://meucomercio.com.br/PERFUME2026/product/badee-al-oud-glory/37','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/a4248397e5df8c6a4197234b871f8e34','perf-000037-badee-al-oud-glory'),
  ('000028','CLUB DE NUIT WOMAN',220.00,'https://meucomercio.com.br/PERFUME2026/product/club-de-nuit-woman/28','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f179ad61432fb7245eca2ca57cdea456','perf-000028-club-de-nuit-woman'),
  ('000023','CREME TXA NIAMICIDA CAPSULE CREAM',180.00,'https://meucomercio.com.br/PERFUME2026/product/creme-txa-niamicida-capsule-cream/23','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/b62d8c9352ec295bd7b879e919f4a729','perf-000023-creme-txa-niamicida-capsule-cream'),
  ('000009','DELILAH MAISON ROSA 100ML',200.00,'https://meucomercio.com.br/PERFUME2026/product/delilah-maison-rosa-100ml/9','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f6d930f7b4366fa066ef5a04381c4ef0','perf-000009-delilah-maison-rosa-100ml'),
  ('000011','DURRET AL AROOS 85ML',130.00,'https://meucomercio.com.br/PERFUME2026/product/durret-al-aroos-85ml/11','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/b5f1930b3f8076752ce25a69dadeb233','perf-000011-durret-al-aroos-85ml'),
  ('000030','FAKHAR BLAK',175.00,'https://meucomercio.com.br/PERFUME2026/product/fakhar-blak/30','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/348152b76cd57f49beca263bcdd5797f','perf-000030-fakhar-blak'),
  ('000029','FAKHAR GOLD',160.00,'https://meucomercio.com.br/PERFUME2026/product/fakhar-gold/29','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/45229966a9d901ca4fc77cdf295e54f4','perf-000029-fakhar-gold'),
  ('000035','HAWAS FOR HER',160.00,'https://meucomercio.com.br/PERFUME2026/product/hawas-for-her/35','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/2d8c7abc821e93fd63d05d1ed187d95a','perf-000035-hawas-for-her'),
  ('000022','MÁSCARA FINO PREMIUM TOUCH',150.00,'https://meucomercio.com.br/PERFUME2026/product/mascara-fino-premium-touch/22','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/1de7bb7fe847b03364393300bd3fc520','perf-000022-mascara-fino-premium-touch'),
  ('000025','MEDICUBE ZERO PORE PAD',200.00,'https://meucomercio.com.br/PERFUME2026/product/medicube-zero-pore-pad/25','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/58bcf7481a06d963f7638f8551916247','perf-000025-medicube-zero-pore-pad'),
  ('000008','MUSAMAM WHITE 100ML',260.00,'https://meucomercio.com.br/PERFUME2026/product/musamam-white-100ml/8','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f29f9ebca80c72028bb30998205efe49','perf-000008-musamam-white-100ml'),
  ('000026','NUMBUZIN NAD+RETINOL',200.00,'https://meucomercio.com.br/PERFUME2026/product/numbuzin-nadretinol/26','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/5430d23d4598078fc176752ecc233910','perf-000026-numbuzin-nadretinol'),
  ('000021','ÓLEO FINO PREMIUM TOUCH',150.00,'https://meucomercio.com.br/PERFUME2026/product/oleo-fino-premium-touch/21','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/a3a0d885606ec6399fd492bbb8f9be4a','perf-000021-oleo-fino-premium-touch'),
  ('000024','PROTETOR SOLAR OMG',130.00,'https://meucomercio.com.br/PERFUME2026/product/protetor-solar-omg/24','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/95d43b1105311ca615026c472ca07b25','perf-000024-protetor-solar-omg'),
  ('000032','QAED AL FURSAN',135.00,'https://meucomercio.com.br/PERFUME2026/product/qaed-al-fursan/32','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/c1f7b7a1ae12386979d610f6dfb28063','perf-000032-qaed-al-fursan'),
  ('000014','SABAH AL WARD 100ML',130.00,'https://meucomercio.com.br/PERFUME2026/product/sabah-al-ward-100ml/14','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/26ab2999e14de5cc79491ad736d3945c','perf-000014-sabah-al-ward-100ml'),
  ('000015','SABAH AL WARD DELILAH 100ML',210.00,'https://meucomercio.com.br/PERFUME2026/product/sabah-al-ward-delilah-100ml/15','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/9e31ddc8bfca9e491a4a12f7e56d8a2f','perf-000015-sabah-al-ward-delilah-100ml'),
  ('000012','SALVO BLACK EAU DE PARFUM 100ML',138.00,'https://meucomercio.com.br/PERFUME2026/product/salvo-black-eau-de-parfum-100ml/12','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f7875f8679908cf8c7c1ba35a5f80507','perf-000012-salvo-black-eau-de-parfum-100ml'),
  ('000013','SALVO INTENSE 100ML',150.00,'https://meucomercio.com.br/PERFUME2026/product/salvo-intense-100ml/13','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/5ad33f9d74dd20fd2c75704aa62060b7','perf-000013-salvo-intense-100ml'),
  ('000016','SILVER SCENT INTENSE 100ML',190.00,'https://meucomercio.com.br/PERFUME2026/product/silver-scent-intense-100ml/16','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/8cbb49c759a4eb2a8ec30eb3d903f465','perf-000016-silver-scent-intense-100ml'),
  ('000017','SILVER SCENT TRADICIONAL 100ML',160.00,'https://meucomercio.com.br/PERFUME2026/product/silver-scent-tradicional-100ml/17','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/0642796f7e3e36d6b519f9881d427730','perf-000017-silver-scent-tradicional-100ml'),
  ('000020','VICTORIA SECRET VELVET PETALS',120.00,'https://meucomercio.com.br/PERFUME2026/product/victoria-secret-velvet-petals/20','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/b163e87efb498b14f17844330f6ad8c4','perf-000020-victoria-secret-velvet-petals'),
  ('000010','VULCAN FEU 100ML',285.00,'https://meucomercio.com.br/PERFUME2026/product/vulcan-feu-100ml/10','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/2d70688c4fd910848f376a2265e8e593','perf-000010-vulcan-feu-100ml'),
  ('000031','YARA AMAERLO',150.00,'https://meucomercio.com.br/PERFUME2026/product/yara-amaerlo/31','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/21da7ef413341882c902dc9ff5f25292','perf-000031-yara-amaerlo'),
  ('000036','YARA CANDY',165.00,'https://meucomercio.com.br/PERFUME2026/product/yara-candy/36','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/0359082cae53418f66850e61c69590df','perf-000036-yara-candy'),
  ('000003','YARA ELIXIR LATTAFA 100ML',195.00,'https://meucomercio.com.br/PERFUME2026/product/yara-elixir-lattafa-100ml/3','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/7eab2913b7b9893f7b4278043291717d','perf-000003-yara-elixir-lattafa-100ml'),
  ('000034','YARA MOI',150.00,'https://meucomercio.com.br/PERFUME2026/product/yara-moi/34','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/52bea85efa2143855d1f7156b8dcd6f2','perf-000034-yara-moi'),
  ('000002','YARA ROSE LATTAFA 100ML',170.00,'https://meucomercio.com.br/PERFUME2026/product/yara-rose-lattafa-100ml/2','https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/f825ba23ea1f3d5f316af821fe4d8391','perf-000002-yara-rose-lattafa-100ml');

insert into public.products(
  brand_id,category_id,name,slug,model,condition,description,highlights,specifications,images,badges,
  active,featured,published_at,image_strategy,catalog_status,commercial_status,storefront_image
)
select
  b.id,c.id,i.product_name,i.product_slug,i.product_name,'novo',
  'Produto novo e lacrado da categoria Perfumaria. Disponibilidade confirmada conforme catálogo do fornecedor.',
  jsonb_build_object('Categoria','Perfumaria'),
  jsonb_build_object('Código do fornecedor',i.code),
  jsonb_build_array(i.image_url),
  array['Novo','Lacrado']::text[],
  true,false,now(),'variant','draft','available',i.image_url
from tmp_perfume_import i
cross join lateral (select id from public.brands where slug='guana-perfumes') b
cross join lateral (select id from public.categories where slug='perfumaria') c
on conflict (slug) do update set
  brand_id=excluded.brand_id,category_id=excluded.category_id,name=excluded.name,model=excluded.model,
  condition='novo',description=excluded.description,highlights=excluded.highlights,specifications=excluded.specifications,
  images=excluded.images,badges=excluded.badges,active=true,commercial_status='available',
  storefront_image=excluded.storefront_image,updated_at=now();

insert into public.product_variants(product_id,sku,active,source_mode,images)
select p.id,'F4-PERF-'||i.code,true,'automatic',jsonb_build_array(i.image_url)
from tmp_perfume_import i
join public.products p on p.slug=i.product_slug
on conflict (sku) do update set
  product_id=excluded.product_id,active=true,source_mode='automatic',images=excluded.images,updated_at=now();

insert into public.supplier_offers(
  supplier_id,variant_id,external_code,source_label,cost,available,source_updated_at,raw_data
)
select s.id,v.id,i.code,'Catálogo Guana Perfumes / PERFUME2026',i.cost,true,now(),
  jsonb_build_object('source_url',i.product_url,'image_url',i.image_url,'import_method','firecrawl','catalog','PERFUME2026')
from tmp_perfume_import i
join public.product_variants v on v.sku='F4-PERF-'||i.code
cross join lateral (select id from public.suppliers where code='F4') s
on conflict (supplier_id,variant_id,external_code) do update set
  cost=excluded.cost,available=true,source_label=excluded.source_label,source_updated_at=excluded.source_updated_at,
  raw_data=excluded.raw_data,updated_at=now();

update public.products p
set catalog_status='ready',published_at=coalesce(p.published_at,now()),updated_at=now()
where p.slug in (select product_slug from tmp_perfume_import)
  and p.catalog_status<>'ready';

update public.suppliers set last_updated_at=now(),updated_at=now() where code='F4';
