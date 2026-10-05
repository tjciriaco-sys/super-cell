update public.product_variants
set images = '["/products/iphone-14-pro-max-branco.webp"]'::jsonb,
    updated_at = now()
where id = '299a0764-3f0c-443a-81a1-0ef18d4ec158';

update public.product_variants
set images = '["/products/iphone-14-pro-max-laranja.webp"]'::jsonb,
    updated_at = now()
where id = '4a2f1637-544c-44cc-9909-3110af72ac00';

update public.product_variants
set images = '["/products/iphone-14-pro-max-dourado.webp"]'::jsonb,
    updated_at = now()
where id = '504b8715-9105-48aa-92fa-ac9acea84265';
