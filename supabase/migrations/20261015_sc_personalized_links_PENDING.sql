-- PREPARAÇÃO: NÃO APLICAR NO SUPABASE DE PRODUÇÃO SEM HOMOLOGAÇÃO.
-- Identidade privada DataCrazy; nunca incluir lead_id em URL ou eventos públicos.
create table if not exists public.sc_personalized_links (
  id uuid primary key default gen_random_uuid(),
  crm_provider text not null default 'datacrazy' check (crm_provider = 'datacrazy'),
  crm_lead_id text not null check (length(crm_lead_id) between 1 and 128),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revoked_at timestamptz,
  constraint sc_personalized_links_provider_lead_unique unique (crm_provider, crm_lead_id)
);
create index if not exists sc_personalized_links_active_token_idx
  on public.sc_personalized_links(token_hash) where revoked_at is null;
alter table public.sc_personalized_links enable row level security;
-- Sem policies públicas: somente backend confiável com credencial server-side.
revoke all on public.sc_personalized_links from anon, authenticated;
comment on table public.sc_personalized_links is
  'Mapa PRIVADO DataCrazy lead -> hash de token. Nunca guardar token em texto puro. Migração pendente de homologação.';
