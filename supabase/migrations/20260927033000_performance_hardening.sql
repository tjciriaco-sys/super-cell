create index products_brand_id_idx on public.products(brand_id);
create index products_category_id_idx on public.products(category_id);
create index product_variants_pinned_supplier_idx on public.product_variants(pinned_supplier_id);
create index import_batches_supplier_id_idx on public.import_batches(supplier_id);
create index import_batches_created_by_idx on public.import_batches(created_by);

drop policy public_acquirer_read on public.payment_acquirers;
create policy public_acquirer_read on public.payment_acquirers for select to anon using (active = true);
drop policy public_installments_read on public.installment_plans;
create policy public_installments_read on public.installment_plans for select to anon using (active = true);
drop policy public_schedules_read on public.logistics_schedules;
create policy public_schedules_read on public.logistics_schedules for select to anon using (active = true);
drop policy public_exceptions_read on public.logistics_exceptions;
create policy public_exceptions_read on public.logistics_exceptions for select to anon using (true);
drop policy public_settings_read on public.commercial_settings;
create policy public_settings_read on public.commercial_settings for select to anon using (public = true);

