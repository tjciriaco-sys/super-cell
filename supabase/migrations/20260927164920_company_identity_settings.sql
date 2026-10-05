insert into public.commercial_settings (key, value, public, description, updated_at)
values
  ('company_cnpj', to_jsonb('57.724.045/0001-26'::text), true, 'CNPJ exibido no rodapé', now()),
  ('company_location', to_jsonb('Natal, Rio Grande do Norte'::text), true, 'Localização pública da empresa', now())
on conflict (key) do update
set value = excluded.value,
    public = excluded.public,
    description = excluded.description,
    updated_at = excluded.updated_at;
