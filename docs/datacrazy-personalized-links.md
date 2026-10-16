# Super Cell — Links personalizados DataCrazy (preparação isolada)

Status: **em preparação; nenhuma alteração em produção**.

## Evidências confirmadas

- O DataCrazy aceita `PATCH https://api.g1.datacrazy.io/api/v1/leads/{id}`, autenticado com Bearer, e documenta `additionalFields`: https://docs.datacrazy.io/api-reference/leads/atualizar-lead
- A automação `Primeiro Contato - Super Cell` extrai referência de anúncio WhatsApp (CTWA, sourceID e conversationId) de `Message-1`, quando presentes, e já grava `SC - Teste CTWA` no lead.
- A automação `Chamar Vendedor - V2` comprovadamente lê `SC - Teste CTWA` por `session.getAdditionalValue` de outra automação.
- O campo adicional `SC - Link Personalizado` já foi criado pelo operador em Lead (Pessoa), tipo Texto Livre (máximo 512 caracteres).
- O DataCrazy permite inserir campos adicionais nas **mensagens de texto** via seletor de variáveis.
- **Arquivo URL Dinâmica** é componente de arquivo/mídia; não usar para enviar uma URL de página de catálogo antes de confirmação do fornecedor.
- Há chaves de API existentes usadas por outras integrações; **não reutilizar nem revogar**.

## Objetivo

Cada lead recebe uma URL individual para o catálogo, reaproveitada quando a mesma pessoa voltar. A URL não deve conter telefone, nome, WhatsApp ID, ctwaClid, UUID do CRM ou outras informações pessoais em texto claro. O identificador de visita será opaco e imprevisível, associado ao lead somente no backend privado.

## Fluxo planejado

1. Captura da identidade estável do lead (ID interno do DataCrazy), sem expô-la na URL.
2. Serviço autenticado consulta um registro persistente por identidade do CRM; se inexistente, gera token aleatório criptograficamente seguro e armazena somente seu hash, com índice único para evitar duplicidade.
3. Retorna URL canônica com token opaco. A rota do catálogo **ainda será definida** após auditoria de rotas/analytics, sem romper SEO ou compartilhamento de links.
4. Escreve a URL em `SC - Link Personalizado`, por mecanismo de campos nativo ou endpoint oficial *após validar* o esquema exato de `additionalFields`. Não sobrescrever outros campos adicionais.
5. Mensagem atual de catálogo recebe a variável do campo adicional em **Mensagem de texto** (não em Arquivo URL Dinâmica), com fallback para `https://catalogo.supercellrn.com` se a geração falhar.
6. A abertura do catálogo registra uma visita consentida/privacidade-compatible, distinguindo acesso de link próprio e compartilhado sem alegar identidade certa do visitante.

## Travas de segurança

- Credencial DataCrazy dedicada (`Super Cell - Links CRM`) somente quando integração segura estiver pronta; nunca colar segredo em chat, GitHub, JS do navegador, URLs, logs ou screenshots.
- Guardar Bearer somente em segredo do backend (Supabase Edge Functions secrets / configuração segura equivalente). Proibir envio ao cliente.
- Não executar PATCH com o formato exemplificativo `additionalFields: ['<string>']`; documentação insuficiente para garantir atualização parcial. Testar isoladamente com lead de laboratório após obter formato preciso.
- Manter automações, rotação dos vendedores, página de produção e domínio atuais intactos até homologação.
- Validar idempotência, consentimento LGPD, política de retenção e possibilidade de revogação do token.
- Não interpretar `ctwaClid` como dado automaticamente autorizado para qualquer envio a Meta; CAPI e vinculação são etapa distinta.

## Verificações antes da implementação

- Confirmar semântica de atualização granular de campos adicionais no DataCrazy (API ou bloco Operações de campos).
- Conferir esquema atual do roteamento Next.js e os eventos Meta em vigor antes de incluir rastreamento de visitas.
- Definir políticas de retenção de links, tratamento de leads duplicados e transferências entre automações.
- Implementar migrations e Edge Function apenas em ambiente de homologação ou com plano reversível; produção depende de aprovação explícita.
- Simular lead novo, retorno, concorrência, ausência de campo, falha no DataCrazy, compartilhamento do link e refresh.

## Critério de conclusão

Somente considerar concluído quando o link individual surgir corretamente na mensagem ao cliente, o mesmo lead reutilizar o mesmo link, as visitas forem registradas com consentimento apropriado e **nenhuma** alteração for observada na distribuição de vendedores ou no envio dos demais textos.

## Implementação preparada na PR #38 (sem publicação)

- `src/lib/personalized-catalog-link.ts`: gera tokens opacos e **deriva deterministicamente** o token de um lead usando `HMAC-SHA256` e `SC_LINK_HMAC_SECRET`. Isso permite recuperar o mesmo link sem armazenar o token em texto claro. Não trocar a chave após ativação sem plano de migração/reemissão.
- `src/lib/personalized-catalog-provision.ts`: serviço **somente backend**, ainda não chamado por endpoint, que realiza upsert idempotente por `(crm_provider, crm_lead_id)` e recusa token revogado.
- `src/lib/personalized-catalog-link.test.ts`: testes de formato, estabilidade, URLs e rejeição de valores inseguros; execução automatizada ainda pendente.
- `supabase/migrations/20261015_sc_personalized_links_PENDING.sql`: SQL preparado mas **não aplicado**. Possui RLS ativado, nenhuma policy pública e revogação de acesso anônimo.

### Dependências seguras para futura homologação

- Criar `SC_LINK_HMAC_SECRET` (ao menos 32 bytes de segredo de alta entropia) **fora do repositório**; preservar para permitir a reemissão do mesmo link.
- Backend precisa de `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` armazenada somente nas variáveis de ambiente do servidor; nunca em bundles públicos.
- Validar migração em branch/staging e executar testes `npm test` / `npm run build` antes de ativar. PR não comprova build enquanto não houver CI verde.
- Reservar campo `SC - Link Personalizado` no lead: nenhuma chamada à API do CRM está habilitada no código atual.
- **Pendência crítica:** forma exata de atualizar somente o campo adicional do lead sem substituir os demais. Documentação `PATCH /leads/{id}` usa exemplo pouco específico para `additionalFields`. Bloquear gravação real até resolver.
- **Pendência de identidade:** um link individual identifica o token enviado, não necessariamente a pessoa que o abriu; links encaminhados a terceiros exigem tratamento distinto.
- **Privacidade:** tokens devem ser tratados como identificadores pseudônimos; cookies, retenção e comunicação de eventos dependem das bases legais e configurações de consentimento.

## Homologação no Supabase atual — 15/10/2026

Autorizado pelo operador utilizar **estrutura isolada no banco atual**, sem tocar dados anteriores. Migração `sc_personalized_links_isolated` aplicada com sucesso no projeto `rgbrdtstbaulxhzievkh`, criando somente `public.sc_personalized_links` e seu índice. Nenhuma tabela antiga foi modificada. O arquivo SQL em `supabase/migrations/20261015_sc_personalized_links_PENDING.sql` corresponde à estrutura preparada, mas o sufixo PENDING do nome agora é histórico.

Validações por SQL transacional e `ROLLBACK`: inserção de dois leads fictícios, rejeição de lead repetido, rejeição de token repetido e marcação de revogação funcionaram. Consulta posterior: `remaining_rows=0`; RLS ativado; zero policies públicas.

**Ainda não homologado:** envio HTTP do DataCrazy, armazenamento de segredos HMAC e Bearer, acesso ao endpoint implantado, emissão de link para lead real e mensagem de WhatsApp. Não ativar automações de produção antes do teste específico.
