insert into public.commercial_settings (key, value, public, description, updated_at)
values ('instagram_url', to_jsonb('https://www.instagram.com/_super.cell1/'::text), true, 'Perfil oficial no Instagram', now())
on conflict (key) do update
set value = excluded.value,
    public = excluded.public,
    description = excluded.description,
    updated_at = excluded.updated_at;
