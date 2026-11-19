# Integração DataCrazy → serviço privado de links (homologação)
 
## Caminho recomendado: sem PATCH na API do CRM

O JavaScript do DataCrazy já demonstrou em lead real que consegue persistir campos com `session.setAdditionalValue`. Portanto, a proposta preferencial **não depende de descobrir o formato de `PATCH additionalFields`**.

**Contrato do backend (novo código, ainda não ativado):**
- `POST /api/integrations/datacrazy/catalog-link`
- `Authorization: Bearer <SEGREDO>` (segredo `SC_LINK_ISSUER_SECRET`, configurado exclusivamente no backend e no bloco HTTP seguro do DataCrazy)
- `Content-Type: application/json`
- Corpo: `{"crmLeadId":"<ID_INTERNO_DO_LEAD>"}`
- Sucesso: `{"url":"https://catalogo.supercellrn.com/?sc_ref=..."}`
- Falhas não exibem detalhes pessoais; cabeçalho `Cache-Control: no-store`.

**Fluxo planejado para ambiente de teste:**
1. Confirmar no parâmetro do DataCrazy um ID **estável do lead pessoa**; não usar `conversationId` mutável.
2. Bloco de API HTTP chama o endpoint privado; registrar resposta como datasource.
3. Bloco JavaScript lê `url` da resposta, valida origem `https://catalogo.supercellrn.com/` e usa `await session.setAdditionalValue("SC - Link Personalizado", url)`.
4. Em automação de laboratório, bloco de mensagem de texto imprime somente a variável do campo adicional; validar substituição real no WhatsApp de teste.
5. Em falha, **não mandar variável vazia**: manter ramo de fallback do link fixo. Não alterar o bloco de atendimento real antes de teste controlado.
 
## Bloqueios deliberados

- Nenhuma migração aplicada; nenhum segredo de produção criado; rota retorna 503 sem `SC_LINK_ISSUER_SECRET`.
- Validar formato e existência do ID do lead no contexto da automação e disponibilidade de cabeçalhos Bearer no bloco HTTP.
- Configurar variáveis de homologação do backend: `SC_LINK_HMAC_SECRET`, `SC_LINK_ISSUER_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL` e `SC_CATALOG_PUBLIC_ORIGIN`; nunca compartilhar valores em chat ou repositório.
- A rota está comprometida na PR de desenvolvimento; não integrar em `main` ou produção sem aprovação.
- A simples abertura de `sc_ref` ainda não registra visita; etapa de coleta de eventos precisa de consentimento/privacidade e tratamento de link compartilhado.
- Evitar logs do corpo ou token.
