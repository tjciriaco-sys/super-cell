alter table public.products
  add column if not exists image_strategy text not null default 'variant';

alter table public.products
  drop constraint if exists products_image_strategy_check;

alter table public.products
  add constraint products_image_strategy_check
  check (image_strategy in ('variant', 'group'));

comment on column public.products.image_strategy is
  'variant: cada cor possui imagem própria; group: uma foto coletiva mostra explicitamente todas as cores oferecidas.';
