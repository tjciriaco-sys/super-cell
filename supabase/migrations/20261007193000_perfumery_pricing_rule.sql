-- Precificação específica da Perfumaria.
-- Regra comercial:
-- preço Pix = custo + entrega (R$ 15) + embalagem (R$ 1) + comissão do vendedor (3,5% do preço) + lucro líquido alvo (R$ 47).
-- Marketing continua tratado fora da unidade como verba mensal.
-- Fórmula: preço = (custo + 16 + 47) / (1 - 0,035), arredondado a centavos.

alter table public.categories
  drop constraint if exists categories_pricing_mode_check;

alter table public.categories
  add constraint categories_pricing_mode_check
  check (pricing_mode = any (array['standard'::text, 'accessory'::text, 'perfumery'::text]));

update public.categories
set pricing_mode='perfumery', updated_at=now()
where slug='perfumaria';

create or replace function internal.perfumery_pix_price(p_cost numeric)
returns numeric
language sql
immutable
strict
set search_path = ''
as $function$
  select round((p_cost + 16 + 47) / (1 - 0.035), 2);
$function$;

comment on function internal.perfumery_pix_price(numeric) is
  'Preço Pix da Perfumaria: custo + R$15 entrega + R$1 embalagem + 3,5% comissão + R$47 resultado líquido alvo. Marketing é verba mensal fora da unidade.';

create or replace function internal.refresh_public_catalog()
returns trigger
language plpgsql
security definer
set search_path = ''
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
    order by t.sort_order limit 1) st on c.pricing_mode='standard'
  left join lateral(
    select coalesce(
      v.manual_price,
      case
        when c.pricing_mode='perfumery' and chosen.cost is not null
          then internal.perfumery_pix_price(chosen.cost)
        when c.pricing_mode='accessory' and at.multiplier is not null
          then internal.round_accessory_price(chosen.cost*at.multiplier)
        when c.pricing_mode='standard' and st.fixed_markup is not null
          then chosen.cost+st.fixed_markup
      end
    ) price_pix
  ) priced on true
  where v.active and (p.commercial_status<>'available' or priced.price_pix>0);

  return null;
end;
$function$;

revoke all on function internal.refresh_public_catalog() from public, anon, authenticated;
revoke all on function internal.perfumery_pix_price(numeric) from public, anon, authenticated;

-- Dispara a reconstrução da vitrine depois da alteração da regra.
update public.products
set updated_at=now()
where category_id=(select id from public.categories where slug='perfumaria');
