insert into public.categories (name, slug, sort_order)
values
  ('Fones de ouvido', 'fones-de-ouvido', 50),
  ('Caixas de som', 'caixas-de-som', 60),
  ('Carregadores', 'carregadores', 70),
  ('Cabos', 'cabos', 80),
  ('Power banks', 'power-banks', 90),
  ('Projetores', 'projetores', 100),
  ('Receptores', 'receptores', 110)
on conflict (slug) do update set name = excluded.name, sort_order = excluded.sort_order, active = true, updated_at = now();

insert into public.brands (name, slug)
values
  ('Basike', 'basike'), ('Lehmox', 'lehmox'), ('X-Cell', 'x-cell'),
  ('Kapbom', 'kapbom'), ('Inova', 'inova'), ('GP', 'gp'),
  ('Wearmax', 'wearmax'), ('Microwear', 'microwear'), ('Champion', 'champion'),
  ('Alphaplay', 'alphaplay'), ('Genérico', 'generico')
on conflict (slug) do update set name = excluded.name, active = true, updated_at = now();

insert into public.suppliers (code, name, active, source_type, notes, last_updated_at)
values ('F3', 'Mundo das Pilhas', true, 'pdf', 'Catálogo de revenda recebido em 27/09/2026. Seleção comercial curada.', now())
on conflict (code) do update set name = excluded.name, active = true, source_type = excluded.source_type,
  notes = excluded.notes, last_updated_at = excluded.last_updated_at, updated_at = now();

create temporary table curated_import (
  brand_slug text, category_slug text, product_name text, product_slug text, model text,
  sku text, cost numeric(12,2), image_path text, supplier_code text, external_code text,
  description text, featured boolean default false
) on commit drop;

insert into curated_import values
  ('basike','fones-de-ouvido','Fone sem fio Basike BA-FON226','fone-sem-fio-basike-ba-fon226','BA-FON226','F3-BA-FON226',115.00,'/products/basike-ba-fon226.webp','F3','BA-FON226','Fone de ouvido sem fio Basike. Modelo e apresentação conferidos no catálogo do fornecedor.',false),
  ('lehmox','fones-de-ouvido','Fone sem fio FON-12967','fone-sem-fio-fon-12967','FON-12967','F3-FON-12967',45.00,'/products/fone-sem-fio-fon-12967.webp','F3','FON-12967','Fone de ouvido sem fio compacto. Disponibilidade confirmada no momento do pedido.',false),
  ('generico','fones-de-ouvido','Fone Bluetooth K-M10','fone-bluetooth-k-m10','K-M10','F3-K-M10',24.00,'/products/fone-bluetooth-k-m10.webp','F3','K-M10','Fone Bluetooth sem fio com estojo. Modelo comercial K-M10.',false),
  ('basike','fones-de-ouvido','Fone estéreo sem fio Basike BA-MD6694','fone-estereo-basike-ba-md6694','BA-MD6694','F3-BA-MD6694',73.00,'/products/basike-ba-md6694.webp','F3','BA-MD6694','Fone estéreo sem fio Basike. Modelo BA-MD6694.',false),
  ('basike','fones-de-ouvido','Fone estéreo Bluetooth Basike BA-MD9856','fone-estereo-bluetooth-basike-ba-md9856','BA-MD9856','F3-BA-MD9856',73.00,'/products/basike-ba-md9856.webp','F3','BA-MD9856','Fone estéreo Bluetooth Basike. Modelo BA-MD9856.',false),

  ('x-cell','projetores','Projetor LED X-Cell XC-PRO1','projetor-led-xcell-xc-pro1','XC-PRO1','F3-XC-PRO1',194.00,'/products/projetor-xcell-xc-pro1.webp','F3','XC-PRO1','Projetor LED compacto X-Cell para entretenimento e apresentações.',true),
  ('generico','projetores','Mini Projetor 4K TY-12289','mini-projetor-4k-ty-12289','TY-12289','F3-TY-12289',380.00,'/products/mini-projetor-4k-ty-12289.webp','F3','TY-12289','Mini projetor comercializado como 4K pelo fornecedor. Compatibilidade e resolução de entrada devem ser confirmadas com o vendedor.',false),

  ('kapbom','caixas-de-som','Caixa de som Kapbom KA-8458','caixa-de-som-kapbom-ka-8458','KA-8458','F3-KA-8458',80.00,'/products/caixa-som-kapbom-ka-8458.webp','F3','KA-8458','Caixa de som portátil Kapbom, modelo KA-8458.',false),
  ('kapbom','caixas-de-som','Caixa de som Kapbom KA-8197','caixa-de-som-kapbom-ka-8197','KA-8197','F3-KA-8197',124.00,'/products/caixa-som-kapbom-ka-8197.webp','F3','KA-8197','Caixa de som portátil Kapbom, modelo KA-8197.',false),
  ('generico','caixas-de-som','Caixa de som portátil GO3','caixa-de-som-portatil-go3','GO3','F3-GO3',49.90,'/products/caixa-som-go3.webp','F3','GO3','Caixa de som portátil compacta, modelo comercial GO3.',false),
  ('generico','caixas-de-som','Caixa de som portátil JMM10','caixa-de-som-portatil-jmm10','JMM10','F3-JMM10',93.00,'/products/caixa-som-jmm10.webp','F3','JMM10','Caixa de som portátil, modelo comercial JMM10.',false),

  ('gp','power-banks','Power bank GP 5.000 mAh','power-bank-gp-5000mah','5000MAH','F3-GP-5000',35.00,'/products/power-bank-gp-5000mah.webp','F3','GP-5000MAH','Bateria portátil GP com capacidade informada de 5.000 mAh.',false),

  ('inova','cabos','Cabo para iPhone 2 metros CBO-20303','cabo-iphone-2m-cbo-20303','CBO-20303','F3-CBO-20303',12.00,'/products/cabo-iphone-cbo-20303.webp','F3','CBO-20303','Cabo de dados para iPhone com 2 metros.',false),
  ('generico','cabos','Cabo USB-C para Lightning ZY5625','cabo-usbc-lightning-zy5625','ZY5625','F3-ZY5625',12.00,'/products/cabo-iphone-usbc-zy5625.webp','F3','ZY5625','Cabo USB-C para Lightning, modelo ZY5625.',false),
  ('generico','cabos','Cabo USB-C para Lightning Turbo CB124','cabo-usbc-lightning-turbo-cb124','CB124','F3-CB124',12.00,'/products/cabo-usbc-lightning-cb124.webp','F3','CB124','Cabo USB-C para Lightning de 1 metro, modelo CB124.',false),
  ('generico','cabos','Cabo USB-C para USB-C CB5703','cabo-usbc-usbc-cb5703','CB5703','F3-CB5703',10.00,'/products/cabo-usbc-usbc-cb5703.webp','F3','CB5703','Cabo USB-C para USB-C, modelo CB5703.',false),

  ('inova','carregadores','Carregador Inova 20W para iPhone','carregador-inova-20w-iphone-car-0094','CAR-0094','F3-CAR-0094',26.00,'/products/carregador-inova-20w-car-0094.webp','F3','CAR-0094','Carregador Inova de 20W com conexão USB-C, indicado para aparelhos compatíveis.',true),
  ('x-cell','carregadores','Carregador turbo X-Cell 5A USB-C','carregador-turbo-xcell-5a-usbc-xc-ur29','XC-UR29','F3-XC-UR29',38.00,'/products/carregador-xcell-5a-xc-ur29.webp','F3','XC-UR29','Carregador turbo X-Cell USB-C, modelo XC-UR29.',false),
  ('x-cell','carregadores','Carregador X-Cell USB e USB-C','carregador-xcell-usb-usbc-xc-ur26','XC-UR26','F3-XC-UR26',29.90,'/products/carregador-duplo-xc-ur26.webp','F3','XC-UR26','Carregador X-Cell com duas conexões: USB e USB-C.',false),

  ('wearmax','smartwatches','Smartwatch Wearmax OS MA20S','smartwatch-wearmax-os-ma20s','MA20S','F3-MA20S',140.00,'/products/smartwatch-wearmax-ma20s.webp','F3','MA20S','Relógio inteligente Wearmax OS, modelo MA20S.',false),
  ('microwear','smartwatches','Smartwatch Microwear Ultramini','smartwatch-microwear-ultramini','ULTRAMINI','F3-ULTRAMINI',190.00,'/products/smartwatch-microwear-ultramini.webp','F3','ULTRAMINI','Relógio inteligente Microwear Ultramini.',true),
  ('generico','smartwatches','Smartwatch S29 Ultra Max','smartwatch-s29-ultra-max','S29 ULTRA MAX','F3-S29-ULTRA-MAX',240.00,'/products/smartwatch-s29-ultra-max.webp','F3','S29-ULTRA-MAX','Relógio inteligente S29 Ultra Max.',false),
  ('champion','smartwatches','Smartwatch Champion C033','smartwatch-champion-c033','C033','F3-C033',430.00,'/products/smartwatch-champion-c033.webp','F3','C033','Smartwatch Champion C033. O catálogo do fornecedor informa produto original com garantia de 1 ano.',false),

  ('alphaplay','receptores','Receptor Alphaplay Plus','receptor-alphaplay-plus','ALPHAPLAY PLUS','F1-ALPHAPLAY-PLUS',450.00,'/products/receptor-alphaplay-plus.webp','F1','52','Receptor Alphaplay Plus. Instalação, canais e compatibilidade devem ser confirmados com o vendedor.',true),
  ('generico','smartwatches','Smartwatch WS10-2 Ultra com 7 pulseiras','smartwatch-ws10-2-ultra-7-pulseiras','WS10-2 ULTRA','F1-WS10-2',110.00,'/products/smartwatch-ws10-2-ultra.webp','F1','77','Smartwatch WS10-2 Ultra acompanhado de kit com 7 pulseiras, conforme catálogo do fornecedor.',true),
  ('generico','smartwatches','Smartwatch KW20 Ultra 2 com 5 pulseiras','smartwatch-kw20-ultra-2-5-pulseiras','KW20 ULTRA 2','F1-KW20-ULTRA-2',120.00,'/products/smartwatch-kw20-ultra-2.webp','F1','76','Smartwatch KW20 Ultra 2 acompanhado de kit com 5 pulseiras, conforme catálogo do fornecedor.',false),
  ('generico','smartwatches','Smartwatch W10 Série 10 46 mm','smartwatch-w10-serie-10-46mm','W10 SÉRIE 10 46MM','F1-W10-SERIE-10',110.00,'/products/smartwatch-w10-serie-10.webp','F1','79','Smartwatch W10 Série 10 em tamanho informado de 46 mm.',false);

insert into public.products (
  brand_id, category_id, name, slug, model, condition, description, highlights,
  specifications, images, badges, active, featured, published_at
)
select b.id, c.id, i.product_name, i.product_slug, i.model, 'novo', i.description,
  jsonb_build_object('Modelo', i.model), '{}'::jsonb, jsonb_build_array(i.image_path),
  array['Novo','Lacrado']::text[], true, i.featured, now()
from curated_import i
join public.brands b on b.slug = i.brand_slug
join public.categories c on c.slug = i.category_slug
on conflict (slug) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  model = excluded.model, description = excluded.description, images = excluded.images,
  badges = excluded.badges, active = true, featured = excluded.featured, updated_at = now();

insert into public.product_variants (product_id, sku, active, source_mode)
select p.id, i.sku, true, 'automatic'
from curated_import i join public.products p on p.slug = i.product_slug
on conflict (sku) do update set active = true, source_mode = 'automatic', updated_at = now();

insert into public.supplier_offers (
  supplier_id, variant_id, external_code, source_label, cost, available, source_updated_at, raw_data
)
select s.id, v.id, i.external_code,
  case when i.supplier_code = 'F3' then 'Catálogo Mundo das Pilhas 27/09/2026' else 'Catálogo Guanacel 27/09/2026' end,
  i.cost, true, now(), jsonb_build_object('import_batch','curadoria-2026-09-27','model',i.model)
from curated_import i
join public.suppliers s on s.code = i.supplier_code
join public.product_variants v on v.sku = i.sku
on conflict (supplier_id, variant_id, external_code) do update set
  cost = excluded.cost, available = true, source_label = excluded.source_label,
  source_updated_at = excluded.source_updated_at, raw_data = excluded.raw_data, updated_at = now();

update public.suppliers set last_updated_at = now(), updated_at = now() where code in ('F1','F3');
