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
