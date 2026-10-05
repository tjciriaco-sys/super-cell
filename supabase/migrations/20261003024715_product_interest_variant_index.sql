create index if not exists product_interests_variant_idx
  on public.product_interests(variant_id)
  where variant_id is not null;
