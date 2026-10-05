insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do nothing;

drop policy if exists "Active admins can upload product images" on storage.objects;
create policy "Active admins can upload product images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'product-images'
  and internal.is_admin()
);

drop policy if exists "Active admins can update product images" on storage.objects;
create policy "Active admins can update product images"
on storage.objects for update to authenticated
using (
  bucket_id = 'product-images'
  and internal.is_admin()
)
with check (
  bucket_id = 'product-images'
  and internal.is_admin()
);

drop policy if exists "Active admins can delete product images" on storage.objects;
create policy "Active admins can delete product images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'product-images'
  and internal.is_admin()
);
