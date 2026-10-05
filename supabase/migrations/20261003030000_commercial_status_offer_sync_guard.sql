-- A product group only becomes available after every active variant has a
-- valid supplier offer. Partial supplier imports must not fail publication
-- validation or advertise unavailable colors/capacities.
create or replace function internal.sync_product_commercial_status()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  affected_product uuid;
  has_any_offer boolean;
  all_variants_have_offer boolean;
  current_status text;
begin
  select v.product_id into affected_product
  from public.product_variants v
  where v.id=coalesce(new.variant_id,old.variant_id);

  if affected_product is null then return null; end if;

  select p.commercial_status into current_status
  from public.products p
  where p.id=affected_product;

  select exists(
    select 1
    from public.product_variants v
    join public.supplier_offers o on o.variant_id=v.id
    join public.suppliers s on s.id=o.supplier_id and s.active
    where v.product_id=affected_product
      and v.active
      and o.available
      and o.cost>0
  ) into has_any_offer;

  select not exists (
    select 1
    from public.product_variants v
    where v.product_id=affected_product
      and v.active
      and not exists (
        select 1
        from public.supplier_offers o
        join public.suppliers s on s.id=o.supplier_id and s.active
        where o.variant_id=v.id
          and o.available
          and o.cost>0
      )
  ) into all_variants_have_offer;

  if has_any_offer and all_variants_have_offer and current_status in ('coming_soon','restocking') then
    update public.products
    set commercial_status='available',updated_at=now()
    where id=affected_product;
  elsif not has_any_offer and current_status='available' then
    update public.products
    set commercial_status='restocking',updated_at=now()
    where id=affected_product;
  end if;

  return null;
end; $$;

revoke all on function internal.sync_product_commercial_status() from public,anon,authenticated;
