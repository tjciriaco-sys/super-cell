update public.supplier_offers so
set cost = 3450.00,
    available = true,
    source_label = 'F1-A — ajuste comercial confirmado em 27/09/2026',
    updated_at = now()
from public.product_variants pv
join public.products p on p.id = pv.product_id
where so.variant_id = pv.id
  and p.slug = 'poco-f8-pro-5g-nfc'
  and pv.color in ('Azul', 'Prata');

update public.supplier_offers so
set available = false,
    source_label = 'F1-A — indisponível conforme confirmação comercial de 27/09/2026',
    updated_at = now()
from public.product_variants pv
join public.products p on p.id = pv.product_id
where so.variant_id = pv.id
  and p.slug = 'poco-f8-pro-5g-nfc'
  and pv.color = 'Preto';

update public.product_variants pv
set active = false,
    updated_at = now()
from public.products p
where p.id = pv.product_id
  and p.slug = 'poco-f8-pro-5g-nfc'
  and pv.color = 'Preto';
