-- Excecao comercial de 19/11/2026: somente ofertas Guanacel oficiais com fonte verificavel.
-- Mantem travas de variantes, precificacao e ofertas; permite publicar mesmo se
-- a foto do fornecedor ainda nao foi convertida para WebP proprio.
CREATE OR REPLACE FUNCTION internal.is_verified_guanacel_catalog_variant(p_variant_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $body$
 SELECT EXISTS (
   SELECT 1 FROM public.supplier_offers o
   JOIN public.suppliers s ON s.id=o.supplier_id AND s.active
   JOIN public.product_variants v ON v.id=o.variant_id
   JOIN public.products p ON p.id=v.product_id
   JOIN public.categories c ON c.id=p.category_id
   WHERE o.variant_id=p_variant_id AND o.available AND o.cost>0
   AND ((s.code='F4' AND c.slug='perfumaria'
     AND o.external_code ~ '^[0-9]+$'
     AND (o.raw_data->>'source_url') LIKE 'https://meucomercio.com.br/PERFUME2026/product/%')
      OR (s.code='F1' AND c.slug IN ('smartphones','iphone','tablets','receptores','smartwatches','eletronicos')
       AND ((o.external_code ~ '^[0-9]+$'
            AND (o.raw_data->>'source_url') LIKE 'https://meucomercio.com.br/GUANACELL08/product/%')
        OR (o.external_code = 'RDI-'||(o.raw_data->>'rdi_product_id')
            AND (o.raw_data->>'product_url') LIKE 'https://guanacell2025.rdi.store/products/%'))))
 );
$body$;

CREATE OR REPLACE FUNCTION internal.all_active_guanacel_catalog_variants(p_product_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $body$
 SELECT EXISTS(SELECT 1 FROM public.product_variants v WHERE v.product_id=p_product_id AND v.active)
    AND NOT EXISTS(SELECT 1 FROM public.product_variants v WHERE v.product_id=p_product_id AND v.active AND NOT internal.is_verified_guanacel_catalog_variant(v.id));
$body$;

REVOKE ALL ON FUNCTION internal.is_verified_guanacel_catalog_variant(uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION internal.all_active_guanacel_catalog_variants(uuid) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION internal.enforce_new_catalog_product_images()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage', 'pg_temp'
AS $function$
DECLARE item record;
BEGIN
  IF NEW.catalog_status IS DISTINCT FROM 'ready'
    OR NEW.created_at < TIMESTAMPTZ '2026-10-19 08:00:00-03'
  THEN RETURN NEW; END IF;

  IF internal.all_active_guanacel_catalog_variants(NEW.id) THEN RETURN NEW; END IF;

  IF NEW.image_strategy = 'group' THEN
    IF NOT internal.has_stored_catalog_webp(NEW.images)
       AND NOT internal.has_stored_catalog_webp(jsonb_build_array(NEW.storefront_image))
    THEN RAISE EXCEPTION 'Publicação bloqueada: foto coletiva sem arquivo WebP verificado no Storage Super Cell.'; END IF;
  ELSE
    FOR item IN SELECT id,color,images FROM public.product_variants
      WHERE product_id = NEW.id AND active
    LOOP
      IF NOT internal.has_stored_catalog_webp(item.images) THEN
        RAISE EXCEPTION 'Publicação bloqueada: variante % sem WebP hospedado e verificado no Storage Super Cell.', item.id;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.enforce_new_variant_images()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'storage', 'pg_temp'
AS $function$
DECLARE item record;
BEGIN
  IF NOT NEW.active THEN RETURN NEW; END IF;
  SELECT created_at, catalog_status, image_strategy INTO item
    FROM public.products WHERE id = NEW.product_id;
  IF FOUND AND item.catalog_status = 'ready'
    AND item.created_at >= TIMESTAMPTZ '2026-10-19 08:00:00-03'
    AND item.image_strategy = 'variant'
    AND NOT internal.has_stored_catalog_webp(NEW.images)
    AND NOT internal.is_verified_guanacel_catalog_variant(NEW.id)
  THEN
    RAISE EXCEPTION 'Variante ativa sem imagem WebP validada no Storage Super Cell. Normalize e envie a foto antes de publicar.';
  END IF;
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION internal.validate_product_for_publication()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  active_variants integer;
  available_variants integer;
  missing_offers integer;
  color_count integer;
  missing_images integer;
  distinct_variant_images integer;
begin
  if new.catalog_status <> 'ready' then return new; end if;

  if tg_op='UPDATE' and old.catalog_status='ready'
     and old.commercial_status=new.commercial_status
     and old.image_strategy=new.image_strategy
     and old.images=new.images then return new; end if;

  select count(*) into active_variants
  from public.product_variants v
  where v.product_id=new.id and v.active;

  if active_variants=0 then
    raise exception 'Produto sem variante ativa não pode ser publicado.';
  end if;

  select count(*) into available_variants
  from public.product_variants v
  where v.product_id=new.id and v.active and v.commercial_status='available';

  if new.commercial_status='available' then
    if available_variants=0 then
      raise exception 'Produto disponível precisa de pelo menos uma variante disponível.';
    end if;

    select count(*) into missing_offers
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and not exists (
        select 1
        from public.supplier_offers o
        join public.suppliers s on s.id=o.supplier_id and s.active
        where o.variant_id=v.id and o.available and o.cost>0
      );

    if missing_offers>0 then
      raise exception 'Variante disponível exige oferta e custo válidos.';
    end if;
  end if;

  if available_variants=0 then return new; end if;

  -- So a checagem de imagem pode ser dispensada para itens oficiais Guanacel.
  if internal.all_active_guanacel_catalog_variants(new.id) then return new; end if;

  select count(distinct lower(trim(v.color))) filter(where v.color is not null)
  into color_count
  from public.product_variants v
  where v.product_id=new.id and v.active and v.commercial_status='available';

  if new.image_strategy='group' then
    if jsonb_typeof(new.images)<>'array' or jsonb_array_length(new.images)=0 then
      raise exception 'Produto com foto coletiva precisa de uma imagem geral.';
    end if;
  elsif color_count>1 then
    select count(*) filter(where jsonb_typeof(v.images)<>'array' or jsonb_array_length(v.images)=0),
           count(distinct v.images::text)
    into missing_images,distinct_variant_images
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and v.color is not null;

    if missing_images>0 or distinct_variant_images<color_count then
      raise exception 'Cada cor disponível precisa de uma imagem própria e diferente antes da publicação.';
    end if;
  elsif not exists(
    select 1
    from public.product_variants v
    where v.product_id=new.id
      and v.active
      and v.commercial_status='available'
      and (
        (jsonb_typeof(v.images)='array' and jsonb_array_length(v.images)>0)
        or (jsonb_typeof(new.images)='array' and jsonb_array_length(new.images)>0)
      )
  ) then
    raise exception 'Variante disponível sem imagem não pode ser publicada.';
  end if;

  return new;
end;
$function$
;
