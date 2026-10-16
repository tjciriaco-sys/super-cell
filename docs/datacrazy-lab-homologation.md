# DataCrazy — homologação de link individual sem tocar no atendimento comercial

**Estado:** Preview Vercel pronta; endpoint privado, tabela `public.sc_personalized_links` criada, variáveis `SC_LINK_HMAC_SECRET`, `SC_LINK_ISSUER_SECRET` e `SUPABASE_SERVICE_ROLE_KEY` restritas à branch de teste. Nenhuma integração real do CRM executada.

## Pré-requisito que depende da interface DataCrazy

Confirmar de onde retirar um **ID estável de Lead (Pessoa)** disponível no fluxo. Não usar `conversationId`, número de telefone ou identificador de anúncio como identificador canônico. O CRM exige que o bloco HTTP possa enviar um header Authorization e ler JSON da resposta.

## Automação de laboratório

1. Duplicar/criar fluxo exclusivamente de teste, sem alterar gatilhos ou distribuição das automações `Primeiro Contato - Super Cell`, `Catálogo Super Cell [Automação]` ou `Chamar Vendedor - V2`.
2. Antes de habilitar qualquer chamada HTTP, confirmar a seleção de **ID de Lead (Pessoa)** na interface do editor.
3. Inserir bloco HTTP POST com URL de Preview: `https://super-cell-36jqb5rlt-tjciriaco-4947s-projects.vercel.app/api/integrations/datacrazy/catalog-link`; header `Content-Type: application/json`; header `Authorization: Bearer <CHAVE_SEGURA>` informado por meio seguro, nunca colado no chat ou campo de lead; corpo `{"crmLeadId":"<ID_DO_LEAD_PESSOA>"}`.
4. Ler JSON `{"url":"https://catalogo.supercellrn.com/?sc_ref=..."}` do datasource HTTP. Validar status 200, domínio canônico, HTTPS e `sc_ref` válido antes de `session.setAdditionalValue("SC - Link Personalizado", url)`.
5. Uma mensagem de texto de laboratório usa o campo `SC - Link Personalizado` no seletor **Adicionais do lead pessoa**, não o bloco Arquivo URL Dinâmica.
6. Testar primeiro 1 lead fictício, depois repetir com o mesmo lead (a URL deve ser idêntica). Testar lead distinto, falha de API e fallback para `https://catalogo.supercellrn.com` sem mandar mensagem vazia.
7. Nunca ativar fluxo de teste com disparo público sem aprovação. Não efetuar merge, alterar Production ou fluxo comercial nesta fase.

## Limites do teste atual

- A Vercel reportou a implantação Preview como READY, mas não houve chamada HTTP autenticada real a esse endpoint; não confundir deploy bem-sucedido com integração concluída.
- A chave de emissão `SC_LINK_ISSUER_SECRET` está armazenada somente no ambiente Preview. Para configurar um header Bearer no DataCrazy, é necessária entrada segura direta pelo operador ou recurso de segredo do CRM; nunca pedir que transcreva a chave neste chat.
- O token do link é pseudônimo; a visita ao catálogo e o retorno efetivo pelo WhatsApp ainda não estão instrumentados.

## Quando solicitar intervenção

Solicitar **uma captura de tela do editor de automação de laboratório do DataCrazy com as opções de ID de lead e bloco HTTP**, sem dados de clientes nem chaves expostas. Essa é a primeira dependência real que impede avançar no CRM.
