-- Super Cell: prevent newly imported products from being published with broken hotlinks.
-- Existing catalog created before 19 Oct 2026 08:00 BRT is grandfathered.
CREATE OR REPLACE FUNCTION internal.has_stored_catalog_webp(urls jsonb)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, storage, pg_temp AS $$
DECLARE image_url text; object_path text;
BEGIN
  IF jsonb_typeof(urls) IS DISTINCT FROM 'array' THEN RETURN false; END IF;
  FOR image_url IN SELECT value FROM jsonb_array_elements_text(urls) LOOP
    IF image_url LIKE 'https://rgbrdtstbaulxhzievkh.supabase.co/storage/v1/object/public/product-images/%.webp' THEN
      object_path := replace(image_url, 'https://rgbrdtstbaulxhzievkh.supabase.co/storage/v1/object/public/product-images/', '');
      IF EXISTS (
        SELECT 1 FROM storage.objects obj
        WHERE obj.bucket_id = 'product-images' AND obj.name = object_path
          AND obj.metadata->>'mimetype' = 'image/webp'
          AND COALESCE((obj.metadata->>'size')::bigint,0) > 2000
      ) THEN RETURN true; END IF;
    END IF;
  END LOOP;
  RETURN false;
END;
$$;

CREATE OR REPLACE FUNCTION internal.enforce_new_catalog_product_images()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, storage, pg_temp AS $$
DECLARE item record;
BEGIN
  IF NEW.catalog_status IS DISTINCT FROM 'ready'
    OR NEW.created_at < TIMESTAMPTZ '2026-10-19 08:00:00-03'
  THEN RETURN NEW; END IF;

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
$$;

DROP TRIGGER IF EXISTS enforce_new_catalog_product_images ON public.products;
CREATE TRIGGER enforce_new_catalog_product_images
BEFORE INSERT OR UPDATE OF catalog_status, image_strategy, images, storefront_image ON public.products
FOR EACH ROW EXECUTE FUNCTION internal.enforce_new_catalog_product_images();

CREATE OR REPLACE FUNCTION internal.enforce_new_variant_images()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, storage, pg_temp AS $$
DECLARE item record;
BEGIN
  IF NOT NEW.active THEN RETURN NEW; END IF;
  SELECT created_at, catalog_status, image_strategy INTO item
    FROM public.products WHERE id = NEW.product_id;
  IF FOUND AND item.catalog_status = 'ready'
    AND item.created_at >= TIMESTAMPTZ '2026-10-19 08:00:00-03'
    AND item.image_strategy = 'variant'
    AND NOT internal.has_stored_catalog_webp(NEW.images)
  THEN
    RAISE EXCEPTION 'Variante ativa sem imagem WebP validada no Storage Super Cell. Normalize e envie a foto antes de publicar.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_new_variant_images ON public.product_variants;
CREATE TRIGGER enforce_new_variant_images
BEFORE INSERT OR UPDATE OF images, active, product_id ON public.product_variants
FOR EACH ROW EXECUTE FUNCTION internal.enforce_new_variant_images();
