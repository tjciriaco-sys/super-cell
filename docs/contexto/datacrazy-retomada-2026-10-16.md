# Super Cell / DataCrazy — roteiro de retomada e diagnóstico de homologação (16/10/2026)

## Estado verificado
- PR #38 (`feat/datacrazy-personalized-links`) segue **draft**, sem merge em `main`.
- Fluxo real de boas-vindas e vendedores **não deve ser editado antes da homologação do endpoint**.
- Fluxo de laboratório `BKUP-Primeiro Contato - Super Cell` testado via trigger webhook do DataCrazy: PowerShell e Início 200; primeiro teste HTTP 401 Vercel Authentication; após incluir `x-vercel-protection-bypass`, resposta **401 JSON Unauthorized do backend**. Isto prova acesso à aplicação, NÃO prova chave correta.
- Banco `public.sc_personalized_links` com RLS ativo; consulta anterior indicou zero registros de `lab_supercell_001`.
- Apenas uma chave pessoal de 40 caracteres foi guardada pelo operador. Há **duas credenciais distintas**: `SC_LINK_ISSUER_SECRET` (Bearer, gerada pelo operador) e `Automation Bypass` (criada na Vercel e aplicada como header). Nunca solicitar envio por chat.
- Preview implantada após alteração manual de segredo pelo operador (READY): `https://super-cell-krsqjvxdq-tjciriaco-4947s-projects.vercel.app`. Atenção: DataCrazy inicialmente apontava para Preview **mais antiga** `super-cell-36jqb5rlt-...`, que capturou configuração anterior à rotação do segredo! **HIPÓTESE PRIORITÁRIA DO 401:** endpoint obsoleto, não cabeçalho mal formatado. Deployments imutáveis têm snapshots independentes das variáveis. Verificar a URL *antes* de solicitar troca de credenciais; não concluir que valores divergem.
- `Authorization: Bearer <SC_LINK_ISSUER_SECRET>` e `x-vercel-protection-bypass: <Automation Bypass>` devem permanecer distintos.
- Rota atual `/api/integrations/datacrazy/catalog-link` devolve 401 para Bearer incompatível, 400 para JSON com ID inválido, 200 `{url}` se provisionamento OK.
- `SC_LINK_ISSUER_SECRET` é restrita à branch Preview na Vercel. Não ativar em Production. Preview com bypass mantém proteção habilitada.

## Amanhã: sequência mínima sem tocar na operação
1. Garantir que o backup DataCrazy está desativado após o teste. Consultar a URL do bloco API, **sem visualizar/copiar valores secretos**, e alterar se necessário para a Preview READY posterior à rotação: `https://super-cell-krsqjvxdq-tjciriaco-4947s-projects.vercel.app/api/integrations/datacrazy/catalog-link`. Se branch foi redeployada depois, verificar a Preview READY atual e variáveis de Preview por branch. Atualizar bypass header apenas se exigido para o destino.
2. Testar primeiro autenticação sem escrita real: `POST` ao endpoint com `{"crmLeadId":"invalid id with spaces"}`. Esperado **400 Invalid lead ID** se Vercel + Bearer passaram; 401 se Bearer falhou; página HTML 401 = proteção Vercel. NÃO enviar segredos por print/chat; **não** gravar em scripts/repo ou histórico de shell.
3. Só após 400, teste `{"crmLeadId":"lab_supercell_001"}` e verificar 200 com URL, e `public.sc_personalized_links`. Repetição deve retornar URL estável e somente uma linha. Não imprimir token URL completo em logs públicos.
4. Trocar corpo do backup para `{"crmLeadId":"{{leadId}}"}`, inserindo a variável usando seletor **Lead → ID do lead**; validar que o DataCrazy substitui o marcador (ID de pessoa e não ID da conversa). Se automação for testada com lead real, obter consentimento para usar contato de teste próprio.
5. Antes de integrar ao fluxo real, inspecionar nós e conexões exatos após a última mensagem com botões **Ver catálogo** e **Chamar vendedor**. Só conectar bloco na execução pós-envio que não interrompa nem altere os ramos de escolha. Configurar fallback sem mensagens ao cliente e sem atrasar caminhos; se a API for síncrona/bloqueante, não inserir no caminho crítico. Considerar automação auxiliar paralela.
6. Com resposta HTTP `{url}`, no JS da automação usar somente URL validada com origem `https://catalogo.supercellrn.com/` e `await session.setAdditionalValue("SC - Link Personalizado", url)`. Em erro, deixar o link comercial atual; não transmitir URL vazia.
7. Meta CTWA: `session.datasources["Message-1"].externalAdReply` pode expor `ctwaClid`, `sourceID`, `sourceApp`; link emitido por lead ainda **não** rastreia visitas e não prova vendas. Implementar medição separadamente em PR futura.

## Proteções
- Não alterar automação principal, mensagens, randomizador de vendedores, templates ou produção sem revisão e teste.
- Bypass é credencial de acesso à proteção das Previews do projeto, não só dessa API; remover/revogar ao terminar.
- Não registrar/trocar segredos em commits, DataCrazy lead fields, conversas nem screenshots.
- Seguir PR #38 draft, ambiente Preview e tabela já existente. Toda implementação adicional deve trazer testes e não exigir deployment de Production.
