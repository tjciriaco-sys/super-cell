insert into public.brands (name, slug)
values ('Hmaston', 'hmaston')
on conflict (slug) do update set name = excluded.name, active = true, updated_at = now();

create temporary table headphone_import (
  brand_slug text, product_name text, product_slug text, model text, sku text,
  cost numeric(12,2), image_path text, external_code text, description text
) on commit drop;

insert into headphone_import values
  ('lehmox','Fone Bluetooth Lehmox LE-391','fone-bluetooth-lehmox-le-391','LE-391','F3-LE-391',45.00,'/products/fone-lehmox-le-391.webp','LE-391','Fone Bluetooth Lehmox, modelo LE-391.'),
  ('basike','Fone com tela colorida Basike BA-FON6696','fone-tela-colorida-basike-ba-fon6696','BA-FON6696','F3-BA-FON6696',75.00,'/products/fone-basike-ba-fon6696.webp','BA-FON6696','Fone Bluetooth Basike com estojo de tela colorida e controle por toque.'),
  ('basike','Fone com tela colorida Basike BA-MD6697','fone-tela-colorida-basike-ba-md6697','BA-MD6697','F3-BA-MD6697',75.00,'/products/fone-basike-ba-md6697.webp','BA-MD6697','Fone Bluetooth Basike com estojo de tela colorida e controle por toque.'),
  ('inova','Fone Bluetooth Inova FON-30032','fone-bluetooth-inova-fon-30032','FON-30032','F3-FON-30032',70.00,'/products/fone-inova-fon-30032.webp','FON-30032','Fone Bluetooth sem fio Inova, modelo FON-30032.'),
  ('lehmox','Fone Bluetooth Lehmox LEF-PRO70','fone-bluetooth-lehmox-lef-pro70','LEF-PRO70','F3-LEF-PRO70',45.00,'/products/fone-lehmox-lef-pro70.webp','LEF-PRO70','Fone Bluetooth Lehmox, modelo LEF-PRO70.'),
  ('x-cell','Fone Bluetooth X-Cell XC-BTH-26','fone-bluetooth-xcell-xc-bth-26','XC-BTH-26','F3-XC-BTH-26',25.00,'/products/fone-xcell-xc-bth26.webp','XC-BTH-26','Fone Bluetooth X-Cell, modelo XC-BTH-26.'),
  ('x-cell','Fone Bluetooth X-Cell XC-BTH-48','fone-bluetooth-xcell-xc-bth-48','XC-BTH-48','F3-XC-BTH-48',59.00,'/products/fone-xcell-xc-bth48.webp','XC-BTH-48','Fone Bluetooth sem fio X-Cell, modelo XC-BTH-48.'),
  ('lehmox','Fone Bluetooth Lehmox LEF-AP10','fone-bluetooth-lehmox-lef-ap10','LEF-AP10','F3-LEF-AP10',32.00,'/products/fone-lehmox-lef-ap10.webp','LEF-AP10','Fone Bluetooth Lehmox, modelo LEF-AP10.'),
  ('x-cell','Fone Bluetooth X-Cell XC-BTH-34','fone-bluetooth-xcell-xc-bth-34','XC-BTH-34','F3-XC-BTH-34',57.00,'/products/fone-xcell-xc-bth34.webp','XC-BTH-34','Fone Bluetooth sem fio X-Cell, modelo XC-BTH-34.'),
  ('basike','Fone Bluetooth Basike BA-FON173','fone-bluetooth-basike-ba-fon173','BA-FON173','F3-BA-FON173',73.00,'/products/fone-basike-ba-fon173.webp','BA-FON173','Fone Bluetooth Basike, modelo BA-FON173.'),
  ('x-cell','Fone Bluetooth X-Cell XC-BTH-54','fone-bluetooth-xcell-xc-bth-54','XC-BTH-54','F3-XC-BTH-54',65.90,'/products/fone-xcell-xc-bth54.webp','XC-BTH-54','Fone Bluetooth X-Cell, modelo XC-BTH-54.'),
  ('lehmox','Fone Bluetooth Lehmox LEF-1023C','fone-bluetooth-lehmox-lef-1023c','LEF-1023C','F3-LEF-1023C',52.00,'/products/fone-lehmox-lef-1023c.webp','LEF-1023C','Fone Bluetooth Lehmox, modelo LEF-1023C.'),
  ('basike','Headphone Bluetooth Basike BA-FON196','headphone-bluetooth-basike-ba-fon196','BA-FON196','F3-BA-FON196',165.00,'/products/fone-basike-ba-fon196.webp','BA-FON196','Headphone Bluetooth Basike, modelo BA-FON196.'),
  ('generico','Headphone Bluetooth P9','headphone-bluetooth-p9','P9','F3-P9',38.00,'/products/fone-headphone-p9.webp','P9','Headphone Bluetooth modelo P9.'),
  ('generico','Headphone Bluetooth Max','headphone-bluetooth-max','AIRPODS MAX','F3-AIRPODS-MAX',100.00,'/products/fone-headphone-airpods-max.webp','AIRPODS-MAX','Headphone Bluetooth estilo Max. Produto sem associação declarada com a Apple.'),
  ('inova','Headphone Bluetooth Inova MD-30226','headphone-bluetooth-inova-md-30226','MD-30226','F3-MD-30226',68.00,'/products/fone-inova-md-30226.webp','MD-30226','Headphone Bluetooth Inova com iluminação, modelo MD-30226.'),
  ('inova','Headphone Bluetooth Inova MD-760','headphone-bluetooth-inova-md-760','MD-760','F3-MD-760',59.90,'/products/fone-inova-md-760.webp','MD-760','Headphone Bluetooth Inova, modelo MD-760.'),
  ('inova','Fone com fio Inova FON-30035','fone-com-fio-inova-fon-30035','FON-30035','F3-FON-30035',12.00,'/products/fone-inova-fon-30035.webp','FON-30035','Fone de ouvido com fio Inova, modelo FON-30035.'),
  ('inova','Fone com fio Inova FON-30137','fone-com-fio-inova-fon-30137','FON-30137','F3-FON-30137',12.00,'/products/fone-inova-fon-30137.webp','FON-30137','Fone de ouvido com fio Inova, modelo FON-30137.'),
  ('lehmox','Fone com fio Lehmox LEF-1217','fone-com-fio-lehmox-lef-1217','LEF-1217','F3-LEF-1217',4.50,'/products/fone-lehmox-lef-1217.webp','LEF-1217','Fone de ouvido com fio Lehmox, modelo LEF-1217.'),
  ('hmaston','Fone com fio Hmaston EJ-96','fone-com-fio-hmaston-ej-96','EJ-96','F3-EJ-96',5.50,'/products/fone-hmaston-ej-96.webp','EJ-96','Fone de ouvido com fio Hmaston, modelo EJ-96.'),
  ('lehmox','Fone com fio Lehmox LEF-1216','fone-com-fio-lehmox-lef-1216','LEF-1216','F3-LEF-1216',4.50,'/products/fone-lehmox-lef-1216.webp','LEF-1216','Fone de ouvido com fio Lehmox, modelo LEF-1216.'),
  ('x-cell','Fone com fio X-Cell XC-F17','fone-com-fio-xcell-xc-f17','XC-F17','F3-XC-F17',6.50,'/products/fone-xcell-xc-f17.webp','XC-F17','Fone de ouvido com fio X-Cell, modelo XC-F17.'),
  ('x-cell','Fone com fio X-Cell XC-F-12','fone-com-fio-xcell-xc-f-12','XC-F-12','F3-XC-F-12',9.50,'/products/fone-xcell-xc-f12.webp','XC-F-12','Fone de ouvido com fio X-Cell, modelo XC-F-12.'),
  ('lehmox','Fone com fio Lehmox LEF-1215','fone-com-fio-lehmox-lef-1215','LEF-1215','F3-LEF-1215',4.50,'/products/fone-lehmox-lef-1215.webp','LEF-1215','Fone de ouvido com fio Lehmox, modelo LEF-1215.'),
  ('x-cell','Fone com fio X-Cell XC-F-15','fone-com-fio-xcell-xc-f-15','XC-F-15','F3-XC-F-15',12.00,'/products/fone-xcell-xc-f15.webp','XC-F-15','Fone estéreo com fio X-Cell, modelo XC-F-15.'),
  ('inova','Fone estéreo com fio Inova FON-11233','fone-estereo-com-fio-inova-fon-11233','FON-11233','F3-FON-11233',8.50,'/products/fone-inova-fon-11233.webp','FON-11233','Fone estéreo com fio Inova, modelo FON-11233.'),
  ('inova','Fone Lightning Inova FON-30156','fone-lightning-inova-fon-30156','FON-30156','F3-FON-30156',15.00,'/products/fone-inova-fon-30156.webp','FON-30156','Fone de ouvido Inova com conector Lightning, modelo FON-30156.'),
  ('hmaston','Fone com fio Hmaston EJ-40','fone-com-fio-hmaston-ej-40','EJ-40','F3-EJ-40',5.50,'/products/fone-hmaston-ej-40.webp','EJ-40','Fone de ouvido com fio Hmaston, modelo EJ-40.'),
  ('hmaston','Fone com fio Hmaston A-FN06','fone-com-fio-hmaston-a-fn06','A-FN06','F3-A-FN06',4.70,'/products/fone-hmaston-a-fn06.webp','A-FN06','Fone de ouvido com fio Hmaston, modelo A-FN06.');

insert into public.products (
  brand_id, category_id, name, slug, model, condition, description, highlights,
  specifications, images, badges, active, featured, published_at
)
select b.id, c.id, i.product_name, i.product_slug, i.model, 'novo', i.description,
  jsonb_build_object('Modelo', i.model), '{}'::jsonb, jsonb_build_array(i.image_path),
  array['Novo','Lacrado']::text[], true, false, now()
from headphone_import i
join public.brands b on b.slug = i.brand_slug
join public.categories c on c.slug = 'fones-de-ouvido'
on conflict (slug) do update set
  brand_id = excluded.brand_id, category_id = excluded.category_id, name = excluded.name,
  model = excluded.model, description = excluded.description, images = excluded.images,
  badges = excluded.badges, active = true, updated_at = now();

insert into public.product_variants (product_id, sku, active, source_mode)
select p.id, i.sku, true, 'automatic'
from headphone_import i join public.products p on p.slug = i.product_slug
on conflict (sku) do update set active = true, source_mode = 'automatic', updated_at = now();

insert into public.supplier_offers (
  supplier_id, variant_id, external_code, source_label, cost, available, source_updated_at, raw_data
)
select s.id, v.id, i.external_code, 'Catálogo Mundo das Pilhas 27/09/2026',
  i.cost, true, now(), jsonb_build_object('import_batch','fones-completos-2026-09-28','model',i.model)
from headphone_import i
join public.suppliers s on s.code = 'F3'
join public.product_variants v on v.sku = i.sku
on conflict (supplier_id, variant_id, external_code) do update set
  cost = excluded.cost, available = true, source_label = excluded.source_label,
  source_updated_at = excluded.source_updated_at, raw_data = excluded.raw_data, updated_at = now();

update public.suppliers
set last_updated_at = now(), updated_at = now()
where code = 'F3';
