create extension if not exists pgcrypto;

create schema if not exists internal;
revoke all on schema internal from public, anon, authenticated;

create table public.admin_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'admin' check (role in ('owner','admin','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function internal.is_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_profiles p
    where p.user_id = (select auth.uid()) and p.active = true
  );
$$;
revoke all on function internal.is_admin() from public;
grant usage on schema internal to authenticated;
grant execute on function internal.is_admin() to authenticated;

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.brands(id),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  model text not null,
  connectivity text,
  condition text not null default 'novo' check (condition in ('novo','seminovo')),
  description text,
  highlights jsonb not null default '{}'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  images jsonb not null default '[]'::jsonb,
  video_url text,
  badges text[] not null default '{}',
  battery_minimum smallint,
  sim_configuration text,
  active boolean not null default true,
  featured boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seminovo_battery check (battery_minimum is null or battery_minimum between 1 and 100)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  ram_gb integer,
  storage_gb integer,
  color text,
  sim_configuration text,
  active boolean not null default true,
  source_mode text not null default 'automatic' check (source_mode in ('automatic','manual')),
  pinned_supplier_id uuid,
  manual_price numeric(12,2),
  manual_price_reason text,
  manual_price_started_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, ram_gb, storage_gb, color)
);

create table public.suppliers (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  active boolean not null default true,
  source_type text,
  source_url text,
  notes text,
  last_updated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_variants
  add constraint product_variants_pinned_supplier_fk
  foreign key (pinned_supplier_id) references public.suppliers(id);

create table public.supplier_offers (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  external_code text,
  source_label text,
  cost numeric(12,2) not null check (cost >= 0),
  available boolean not null default true,
  source_updated_at timestamptz,
  raw_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(supplier_id, variant_id, external_code)
);

create table public.pricing_tiers (
  id uuid primary key default gen_random_uuid(),
  min_cost numeric(12,2) not null,
  max_cost numeric(12,2),
  fixed_markup numeric(12,2) not null,
  sort_order integer not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_tier check (max_cost is null or max_cost >= min_cost)
);

create table public.operational_costs (
  id boolean primary key default true check (id = true),
  seller_commission_percent numeric(6,4) not null default 0.01,
  delivery_cost numeric(12,2) not null default 15,
  packaging_cost numeric(12,2) not null default 1,
  updated_at timestamptz not null default now()
);

create table public.payment_acquirers (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  active boolean not null default true,
  is_current boolean not null default false,
  settlement_label text,
  max_installments integer not null default 12 check (max_installments between 1 and 24),
  featured_primary integer not null default 12,
  featured_secondary integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_current_acquirer on public.payment_acquirers(is_current) where is_current;

create table public.installment_plans (
  id uuid primary key default gen_random_uuid(),
  acquirer_id uuid not null references public.payment_acquirers(id) on delete cascade,
  installments integer not null check (installments between 1 and 24),
  factor numeric(10,6) not null check (factor >= 1),
  source_method text not null default 'effective_factor',
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique(acquirer_id, installments)
);

create table public.logistics_schedules (
  id uuid primary key default gen_random_uuid(),
  weekday smallint not null check (weekday between 0 and 6),
  departure_time time not null,
  cutoff_minutes integer not null default 60 check (cutoff_minutes between 0 and 1440),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(weekday, departure_time)
);

create table public.logistics_exceptions (
  id uuid primary key default gen_random_uuid(),
  exception_date date not null unique,
  no_routes boolean not null default false,
  custom_routes jsonb not null default '[]'::jsonb,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.commercial_settings (
  key text primary key,
  value jsonb not null,
  public boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid references public.suppliers(id),
  source_format text,
  source_name text,
  status text not null default 'draft' check (status in ('draft','review','applied','failed')),
  items_total integer not null default 0,
  unchanged_count integer not null default 0,
  cost_decrease_count integer not null default 0,
  cost_increase_count integer not null default 0,
  new_count integer not null default 0,
  missing_count integer not null default 0,
  summary jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  applied_at timestamptz
);

create table public.change_log (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id text,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid,
  created_at timestamptz not null default now()
);

create table public.public_catalog (
  variant_id uuid primary key,
  product_id uuid not null,
  slug text not null,
  product_name text not null,
  model text not null,
  brand_name text not null,
  brand_slug text not null,
  category_name text not null,
  category_slug text not null,
  condition text not null,
  connectivity text,
  ram_gb integer,
  storage_gb integer,
  color text,
  sim_configuration text,
  battery_minimum smallint,
  description text,
  highlights jsonb not null,
  specifications jsonb not null,
  images jsonb not null,
  video_url text,
  badges text[] not null,
  featured boolean not null,
  price_pix numeric(12,2) not null,
  available boolean not null,
  updated_at timestamptz not null default now()
);

create index public_catalog_search_idx on public.public_catalog using gin (
  to_tsvector('portuguese', product_name || ' ' || model || ' ' || brand_name || ' ' || coalesce(color,'') || ' ' || coalesce(storage_gb::text,''))
);
create index public_catalog_slug_idx on public.public_catalog(slug);
create index supplier_offers_variant_available_idx on public.supplier_offers(variant_id, available, cost);
create index change_log_created_idx on public.change_log(created_at desc);

create or replace function internal.refresh_public_catalog()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  delete from public.public_catalog;
  insert into public.public_catalog (
    variant_id, product_id, slug, product_name, model, brand_name, brand_slug,
    category_name, category_slug, condition, connectivity, ram_gb, storage_gb,
    color, sim_configuration, battery_minimum, description, highlights,
    specifications, images, video_url, badges, featured, price_pix, available, updated_at
  )
  select
    v.id, p.id, p.slug, p.name, p.model, b.name, b.slug,
    c.name, c.slug, p.condition, p.connectivity, v.ram_gb, v.storage_gb,
    v.color, coalesce(v.sim_configuration, p.sim_configuration), p.battery_minimum,
    p.description, p.highlights, p.specifications, p.images, p.video_url,
    p.badges, p.featured,
    coalesce(v.manual_price, chosen.cost + tier.fixed_markup), true, now()
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
  join lateral (
    select t.fixed_markup
    from public.pricing_tiers t
    where t.active and chosen.cost >= t.min_cost
      and (t.max_cost is null or chosen.cost <= t.max_cost)
    order by t.sort_order
    limit 1
  ) tier on true
  where v.active and coalesce(v.manual_price, chosen.cost + tier.fixed_markup) > 0;
  return null;
end;
$$;
revoke all on function internal.refresh_public_catalog() from public, anon, authenticated;

create or replace function internal.audit_change()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.change_log(table_name, record_id, action, old_data, new_data, changed_by)
  values (
    tg_table_name,
    coalesce((case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'id',
             (case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end)->>'key'),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    (select auth.uid())
  );
  return coalesce(new, old);
end;
$$;
revoke all on function internal.audit_change() from public, anon, authenticated;

do $$
declare t text;
begin
  foreach t in array array['products','product_variants','supplier_offers','pricing_tiers','payment_acquirers','installment_plans','logistics_schedules','logistics_exceptions','commercial_settings']
  loop
    execute format('create trigger audit_%I after insert or update or delete on public.%I for each row execute function internal.audit_change()', t, t);
  end loop;
end $$;

create trigger refresh_catalog_products after insert or update or delete on public.products for each statement execute function internal.refresh_public_catalog();
create trigger refresh_catalog_variants after insert or update or delete on public.product_variants for each statement execute function internal.refresh_public_catalog();
create trigger refresh_catalog_offers after insert or update or delete on public.supplier_offers for each statement execute function internal.refresh_public_catalog();
create trigger refresh_catalog_tiers after insert or update or delete on public.pricing_tiers for each statement execute function internal.refresh_public_catalog();
create trigger refresh_catalog_brands after insert or update or delete on public.brands for each statement execute function internal.refresh_public_catalog();
create trigger refresh_catalog_categories after insert or update or delete on public.categories for each statement execute function internal.refresh_public_catalog();

alter table public.admin_profiles enable row level security;
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.suppliers enable row level security;
alter table public.supplier_offers enable row level security;
alter table public.pricing_tiers enable row level security;
alter table public.operational_costs enable row level security;
alter table public.payment_acquirers enable row level security;
alter table public.installment_plans enable row level security;
alter table public.logistics_schedules enable row level security;
alter table public.logistics_exceptions enable row level security;
alter table public.commercial_settings enable row level security;
alter table public.import_batches enable row level security;
alter table public.change_log enable row level security;
alter table public.public_catalog enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.public_catalog to anon, authenticated;
grant select on public.payment_acquirers, public.installment_plans, public.logistics_schedules, public.logistics_exceptions to anon, authenticated;
grant select on public.commercial_settings to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
revoke insert, update, delete on public.public_catalog from authenticated;

create policy public_catalog_read on public.public_catalog for select to anon, authenticated using (true);
create policy public_acquirer_read on public.payment_acquirers for select to anon, authenticated using (active = true);
create policy public_installments_read on public.installment_plans for select to anon, authenticated using (active = true);
create policy public_schedules_read on public.logistics_schedules for select to anon, authenticated using (active = true);
create policy public_exceptions_read on public.logistics_exceptions for select to anon, authenticated using (true);
create policy public_settings_read on public.commercial_settings for select to anon, authenticated using (public = true);
create policy admin_profile_self on public.admin_profiles for select to authenticated using (user_id = (select auth.uid()));

do $$
declare t text;
begin
  foreach t in array array['brands','categories','products','product_variants','suppliers','supplier_offers','pricing_tiers','operational_costs','payment_acquirers','installment_plans','logistics_schedules','logistics_exceptions','commercial_settings','import_batches','change_log']
  loop
    execute format('create policy admin_all_%I on public.%I for all to authenticated using ((select internal.is_admin())) with check ((select internal.is_admin()))', t, t);
  end loop;
end $$;

insert into public.brands(name,slug) values
('Apple','apple'),('Xiaomi','xiaomi'),('Redmi','redmi'),('POCO','poco'),('Multilaser','multilaser'),('Outros','outros');

insert into public.categories(name,slug,sort_order) values
('iPhone','iphone',1),('Smartphones','smartphones',2),('Tablets','tablets',3),('Smartwatches','smartwatches',4),('Acessórios','acessorios',5),('Eletrônicos','eletronicos',6);

insert into public.suppliers(code,name,source_type,source_url,notes,last_updated_at) values
('F1','Guanacel','catalogo_online','https://meucomercio.com.br/GUANACELL08','Fornecedor principal; fontes F1-A catálogo e F1-B listas rápidas.',now()),
('F2','Ramoncel','lista_assistida',null,'Estrutura preparada; ainda sem carga.',null);

insert into public.pricing_tiers(min_cost,max_cost,fixed_markup,sort_order) values
(0,500,77,1),(500.01,1000,97,2),(1000.01,1500,127,3),(1500.01,2500,147,4),(2500.01,null,197,5);
insert into public.operational_costs default values;

insert into public.payment_acquirers(name,code,is_current,settlement_label,max_installments,featured_primary,featured_secondary) values
('Mercado Pago','mercado-pago',true,'Liquidez / capital de giro',18,12,18),
('PagBank','pagbank',false,'D+1',18,12,18);

with a as (select id from public.payment_acquirers where code='mercado-pago')
insert into public.installment_plans(acquirer_id,installments,factor,source_method)
select a.id, x.n, x.f, x.m from a cross join (values
(1,1/(1-0.0310::numeric),'taxa'),(2,1/(1-0.0644::numeric),'taxa'),(3,1/(1-0.0749::numeric),'taxa'),
(4,1/(1-0.0839::numeric),'taxa'),(5,1/(1-0.0926::numeric),'taxa'),(6,1/(1-0.1087::numeric),'taxa'),
(7,1/(1-0.1163::numeric),'taxa'),(8,1/(1-0.1184::numeric),'taxa'),(9,1/(1-0.1186::numeric),'taxa'),
(10,1/(1-0.1187::numeric),'taxa'),(11,1/(1-0.1191::numeric),'taxa'),(12,1/(1-0.1199::numeric),'taxa'),
(13,1.16171,'fator_efetivo'),(14,1.17467,'fator_efetivo'),(15,1.18906,'fator_efetivo'),
(16,1.20496,'fator_efetivo'),(17,1.22294,'fator_efetivo'),(18,1.24285,'fator_efetivo')
) as x(n,f,m);

with a as (select id from public.payment_acquirers where code='pagbank')
insert into public.installment_plans(acquirer_id,installments,factor,source_method)
select a.id, x.n, x.f, 'fator_efetivo' from a cross join (values
(1,1.03083),(2,1.04461),(3,1.05231),(4,1.06034),(5,1.06815),(6,1.07608),
(7,1.08261),(8,1.09052),(9,1.09855),(10,1.10669),(11,1.11483),(12,1.12296),
(13,1.13110),(14,1.13935),(15,1.14772),(16,1.15607),(17,1.16442),(18,1.17275)
) as x(n,f);

insert into public.logistics_schedules(weekday,departure_time,cutoff_minutes)
select d,t,60 from unnest(array[1,2,3,4,5]) d cross join unnest(array['10:00'::time,'15:00'::time,'18:00'::time]) t;
insert into public.logistics_schedules(weekday,departure_time,cutoff_minutes) values
(6,'10:00',60),(6,'14:00',60);

insert into public.commercial_settings(key,value,public,description) values
('whatsapp_sales', '"5584999999999"', true, 'Número de vendas em formato internacional'),
('cash_on_delivery_enabled','true',true,'Pagamento somente na entrega'),
('cash_on_delivery_text','"Você não paga nada agora. Pagamento somente na entrega."',true,'Texto comercial'),
('used_iphone_battery_minimum','85',true,'Bateria mínima pública para iPhones seminovos'),
('timezone','"America/Fortaleza"',true,'Timezone operacional'),
('seller_commission_percent','0.01',false,'Comissão de vendedor'),
('delivery_cost','15',false,'Custo unitário de entrega'),
('packaging_cost','1',false,'Custo unitário de embalagem');

-- Catálogo F1-A observado em 26/09/2026 e carga histórica F1-B fornecida pelo proprietário.
with refs as (
  select
    (select id from public.brands where slug='poco') poco,
    (select id from public.brands where slug='xiaomi') xiaomi,
    (select id from public.brands where slug='redmi') redmi,
    (select id from public.brands where slug='apple') apple,
    (select id from public.categories where slug='smartphones') smartphones,
    (select id from public.categories where slug='iphone') iphone,
    (select id from public.categories where slug='tablets') tablets
)
insert into public.products(brand_id,category_id,name,slug,model,connectivity,condition,description,highlights,specifications,images,badges,battery_minimum,sim_configuration,active,featured,published_at)
select poco,smartphones,'POCO F8 Pro 5G NFC','poco-f8-pro-5g-nfc','F8 Pro','5G','novo',
'Desempenho premium com tela fluida, bateria de longa duração e conectividade completa.',
'{"Tela":"6,59\" AMOLED · 120 Hz","Desempenho":"Snapdragon 8 Elite · 12 GB RAM","Câmeras":"Principal de 50 MP com OIS","Bateria":"6.210 mAh · carregamento rápido","Memória":"12 GB + 512 GB","Conectividade":"5G · NFC · Dual SIM"}'::jsonb,
'{"Tela":{"Tamanho":"6,59 polegadas","Tecnologia":"AMOLED","Taxa de atualização":"120 Hz"},"Desempenho":{"Chipset":"Snapdragon 8 Elite","RAM":"12 GB","Armazenamento":"512 GB"},"Câmeras":{"Principal":"50 MP com OIS"},"Bateria":{"Capacidade":"6.210 mAh"},"Conectividade":{"5G":"Sim","NFC":"Sim","SIM":"Dual SIM"}}'::jsonb,
'["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/3eb7df16ee53229fe354e63badffd438"]'::jsonb,'{Mais vendido}'::text[],null::smallint,'Dual SIM'::text,true,true,now()
from refs
union all select poco,smartphones,'POCO C71','poco-c71','C71','4G','novo','Smartphone acessível para tarefas do dia a dia.','{"Tela":"Tela ampla","Desempenho":"3 GB RAM","Memória":"3 GB + 64 GB","Conectividade":"4G · Dual SIM"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/86f014e754cc32badc083034a8e4f549"]','{}',null,'Dual SIM',true,false,now() from refs
union all select xiaomi,smartphones,'Xiaomi 14T NFC','xiaomi-14t-nfc','14T','5G','novo','Desempenho avançado, câmera versátil e ampla memória.','{"Tela":"6,67\" AMOLED · 144 Hz","Desempenho":"12 GB RAM","Memória":"12 GB + 512 GB","Conectividade":"5G · NFC"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/1d0dadf90d65b2a50911211f746e153a"]','{}',null,'Dual SIM',true,true,now() from refs
union all select xiaomi,tablets,'Xiaomi Pad 7','xiaomi-pad-7','Pad 7',null,'novo','Tablet de alto desempenho para produtividade e entretenimento.','{"Tela":"11,2\" · 144 Hz","Desempenho":"8 GB RAM","Memória":"8 GB + 256 GB"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/7712a5b6e3a72116d74a3c60776dd705"]','{}',null,null,true,false,now() from refs
union all select redmi,tablets,'Redmi Pad 2 Pro','redmi-pad-2-pro','Pad 2 Pro',null,'novo','Tablet com tela ampla e bateria para o dia inteiro.','{"Tela":"Tela ampla","Desempenho":"6 GB RAM","Memória":"6 GB + 128 GB"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/c43b98353ef15085c7de1059e2e19afe"]','{}',null,null,true,false,now() from refs
union all select apple,iphone,'iPhone 13','iphone-13-seminovo','iPhone 13','5G','seminovo','iPhone seminovo revisado com bateria mínima garantida de 85%. Cor e percentual exato sujeitos à disponibilidade.','{"Tela":"6,1\" Super Retina XDR OLED","Desempenho":"Chip A15 Bionic","Câmeras":"Sistema duplo de 12 MP","Memória":"128 GB","Conectividade":"5G · NFC · SIM físico + eSIM"}','{"Tela":{"Tamanho":"6,1 polegadas","Tecnologia":"Super Retina XDR OLED"},"Desempenho":{"Chipset":"A15 Bionic"},"Câmeras":{"Principal":"Sistema duplo de 12 MP"},"Conectividade":{"5G":"Sim","NFC":"Sim","SIM":"nano-SIM + eSIM"},"Sistema":{"Sistema operacional":"iOS"}}','[]','{Seminovo}',85,'nano-SIM + eSIM',true,true,now() from refs
union all select apple,iphone,'iPhone 13 Pro','iphone-13-pro-seminovo','iPhone 13 Pro','5G','seminovo','iPhone Pro seminovo revisado com bateria mínima garantida de 85%.','{"Tela":"6,1\" Super Retina XDR OLED · ProMotion","Desempenho":"Chip A15 Bionic","Câmeras":"Sistema Pro de 12 MP","Memória":"128 GB","Conectividade":"5G · SIM físico + eSIM"}','{}','[]','{Seminovo}',85,'nano-SIM + eSIM',true,true,now() from refs
union all select apple,iphone,'iPhone 14 Pro Max','iphone-14-pro-max-seminovo','iPhone 14 Pro Max','5G','seminovo','iPhone Pro Max seminovo revisado com bateria mínima garantida de 85%.','{"Tela":"6,7\" Super Retina XDR OLED · 120 Hz","Desempenho":"Chip A16 Bionic","Câmeras":"Principal de 48 MP","Memória":"128 GB ou 256 GB","Conectividade":"5G · SIM conforme versão"}','{}','[]','{Seminovo}',85,'Confirmar versão comercial',true,true,now() from refs
union all select apple,iphone,'iPhone 15','iphone-15-seminovo','iPhone 15','5G','seminovo','iPhone seminovo revisado com bateria mínima garantida de 85%.','{"Tela":"6,1\" Super Retina XDR OLED","Desempenho":"Chip A16 Bionic","Câmeras":"Principal de 48 MP","Memória":"128 GB","Conectividade":"5G · USB-C · SIM conforme versão"}','{}','[]','{Seminovo}',85,'Confirmar versão comercial',true,true,now() from refs
union all select apple,iphone,'iPhone 17 Pro','iphone-17-pro','iPhone 17 Pro','5G','novo','iPhone lacrado com chip A19 Pro e conjunto avançado de câmeras.','{"Tela":"6,3\" Super Retina XDR OLED · 120 Hz","Desempenho":"Chip A19 Pro","Câmeras":"Sistema Pro","Memória":"256 GB","Conectividade":"5G · eSIM/SIM conforme versão"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/9563d3d758d36ea59e1b668e497d78be"]','{Novo}',null,'Confirmar versão comercial',true,true,now() from refs
union all select apple,iphone,'iPhone 17 Pro Max','iphone-17-pro-max','iPhone 17 Pro Max','5G','novo','iPhone Pro Max lacrado com chip A19 Pro e tela ampla.','{"Tela":"6,9\" Super Retina XDR OLED · 120 Hz","Desempenho":"Chip A19 Pro","Câmeras":"Sistema Pro","Memória":"256 GB","Conectividade":"5G · eSIM/SIM conforme versão"}','{}','["https://storage.googleapis.com/nexapp-flutter.appspot.com/production/products/1d680424bdfa684db6ec73a0d4843ea4"]','{Novo}',null,'Confirmar versão comercial',true,true,now() from refs;

insert into public.product_variants(product_id,sku,ram_gb,storage_gb,color,sim_configuration)
select id,'POCO-F8P-12-512-AZ',12,512,'Azul','Dual SIM' from public.products where slug='poco-f8-pro-5g-nfc'
union all select id,'POCO-F8P-12-512-PR',12,512,'Prata','Dual SIM' from public.products where slug='poco-f8-pro-5g-nfc'
union all select id,'POCO-F8P-12-512-PT',12,512,'Preto','Dual SIM' from public.products where slug='poco-f8-pro-5g-nfc'
union all select id,'POCO-C71-3-64-PT',3,64,'Preto','Dual SIM' from public.products where slug='poco-c71'
union all select id,'POCO-C71-3-64-AZ',3,64,'Azul','Dual SIM' from public.products where slug='poco-c71'
union all select id,'XIA-14T-12-512-VD',12,512,'Verde','Dual SIM' from public.products where slug='xiaomi-14t-nfc'
union all select id,'XIA-PAD7-8-256-CZ',8,256,'Cinza',null from public.products where slug='xiaomi-pad-7'
union all select id,'REDMI-PAD2P-6-128-CZ',6,128,'Cinza',null from public.products where slug='redmi-pad-2-pro'
union all select id,'IP13-128-ROSA',null,128,'Rosa','nano-SIM + eSIM' from public.products where slug='iphone-13-seminovo'
union all select id,'IP13-128-AZ',null,128,'Azul','nano-SIM + eSIM' from public.products where slug='iphone-13-seminovo'
union all select id,'IP13-128-PT',null,128,'Preto','nano-SIM + eSIM' from public.products where slug='iphone-13-seminovo'
union all select id,'IP13P-128-BR',null,128,'Branco','nano-SIM + eSIM' from public.products where slug='iphone-13-pro-seminovo'
union all select id,'IP13P-128-CZ',null,128,'Cinza','nano-SIM + eSIM' from public.products where slug='iphone-13-pro-seminovo'
union all select id,'IP13P-128-AZ',null,128,'Azul','nano-SIM + eSIM' from public.products where slug='iphone-13-pro-seminovo'
union all select id,'IP14PM-128-BR',null,128,'Branco','Confirmar versão comercial' from public.products where slug='iphone-14-pro-max-seminovo'
union all select id,'IP14PM-128-LA',null,128,'Laranja','Confirmar versão comercial' from public.products where slug='iphone-14-pro-max-seminovo'
union all select id,'IP14PM-256-DO',null,256,'Dourado','Confirmar versão comercial' from public.products where slug='iphone-14-pro-max-seminovo'
union all select id,'IP15-128-VD',null,128,'Verde','Confirmar versão comercial' from public.products where slug='iphone-15-seminovo'
union all select id,'IP15-128-AZ',null,128,'Azul','Confirmar versão comercial' from public.products where slug='iphone-15-seminovo'
union all select id,'IP15-128-ROSA',null,128,'Rosa','Confirmar versão comercial' from public.products where slug='iphone-15-seminovo'
union all select id,'IP17P-256-LA',null,256,'Laranja','Confirmar versão comercial' from public.products where slug='iphone-17-pro'
union all select id,'IP17PM-256-AZ',null,256,'Azul','Confirmar versão comercial' from public.products where slug='iphone-17-pro-max';

with s as (select id from public.suppliers where code='F1')
insert into public.supplier_offers(supplier_id,variant_id,external_code,source_label,cost,available,source_updated_at,raw_data)
select s.id,v.id,x.code,x.source,x.cost,true,'2026-09-26',x.raw::jsonb
from s cross join (values
('POCO-F8P-12-512-AZ','1000050','F1-A',3400,'{"observacao":"catálogo online"}'),
('POCO-F8P-12-512-PR','000025','F1-A',3600,'{}'),('POCO-F8P-12-512-PT','1000056','F1-A',3400,'{}'),
('POCO-C71-3-64-PT','1000037','F1-A',680,'{}'),('POCO-C71-3-64-AZ','000137','F1-A',680,'{}'),
('XIA-14T-12-512-VD','1000084','F1-A',2400,'{}'),('XIA-PAD7-8-256-CZ','000060','F1-A',1990,'{}'),
('REDMI-PAD2P-6-128-CZ','000059','F1-A',1550,'{}'),
('IP13-128-ROSA','LISTA-1301','F1-B',1950,'{"bateria_historica":94}'),
('IP13-128-AZ','LISTA-1302','F1-B',1930,'{"bateria_historica":88}'),
('IP13-128-PT','LISTA-1303','F1-B',1930,'{"bateria_historica":88}'),
('IP13P-128-BR','LISTA-13P01','F1-B',2480,'{"bateria_historica":92}'),
('IP13P-128-CZ','LISTA-13P02','F1-B',2480,'{"bateria_historica":92}'),
('IP13P-128-AZ','LISTA-13P03','F1-B',2480,'{"bateria_historica":91}'),
('IP14PM-128-BR','LISTA-14PM01','F1-B',3200,'{"bateria_historica":86}'),
('IP14PM-128-LA','LISTA-14PM02','F1-B',3200,'{"bateria_historica":88}'),
('IP14PM-256-DO','LISTA-14PM03','F1-B',3380,'{"bateria_historica":92}'),
('IP15-128-VD','LISTA-1501','F1-B',2580,'{"bateria_historica":90}'),
('IP15-128-AZ','LISTA-1502','F1-B',2680,'{"bateria_historica":92}'),
('IP15-128-ROSA','LISTA-1503','F1-B',2680,'{"bateria_historica":90}'),
('IP17P-256-LA','LISTA-17P01','F1-B',6990,'{"condicao":"lacrado"}'),
('IP17PM-256-AZ','LISTA-17PM01','F1-B',7400,'{"condicao":"lacrado"}')
) as x(sku,code,source,cost,raw)
join public.product_variants v on v.sku=x.sku;

-- iPhone 13 Pro Max de 76% foi deliberadamente excluído da oferta pública padrão.
