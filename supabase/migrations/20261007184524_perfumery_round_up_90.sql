-- Arredondamento comercial da Perfumaria.
-- Preserva resultado mínimo de R$ 47 após comissão de 3,5%, entrega e embalagem.
-- Todo preço automático de perfumaria termina em R$ 0,90.

create or replace function internal.perfumery_pix_price(p_cost numeric)
returns numeric
language sql
immutable
strict
set search_path = ''
as $function$
  select ceil(((p_cost + 16 + 47) / (1 - 0.035)) - 0.90) + 0.90;
$function$;

comment on function internal.perfumery_pix_price(numeric) is
  'Preço Pix da Perfumaria: custo + R$15 entrega + R$1 embalagem + 3,5% comissão + resultado mínimo de R$47, arredondado sempre para cima ao próximo preço terminado em R$0,90. Marketing é verba mensal fora da unidade.';

update public.products
set updated_at=now()
where category_id=(select id from public.categories where slug='perfumaria');
