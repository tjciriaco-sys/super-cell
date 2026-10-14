# Super Cell — contexto consolidado da sessão 07–08/10/2026

Este arquivo registra as decisões, implementações, correções e pendências dos dois ciclos recentes de implementação da Super Cell. Use-o para continuidade em novo chat sem depender do histórico da conversa.

## Infraestrutura confirmada

- GitHub: `tjciriaco-sys/super-cell`
- branch padrão: `main`
- Vercel project: `prj_wRkmMrU4AvADjSW1vjGsqDcafjy7`
- Vercel team: `team_EZU9CToKIbcO6z4YxiFQc2EJ`
- Supabase project: `rgbrdtstbaulxhzievkh`
- produção: `https://catalogo.supercellrn.com`

## Método operacional

O desenvolvimento agora é Plugin First:
- planejar no chat;
- implementar diretamente via GitHub;
- validar Preview Vercel;
- usar Supabase só quando banco/storage/auth forem necessários;
- mesclar/publicar após validação;
- evitar comandos para o usuário executar em Work/Codex quando os plugins resolvem.

O usuário prefere que o chat implemente diretamente após autorização, sem enviar blocos para copiar e colar.

## Rodada de UX da página do produto

Foram consolidados:
- trade-in “Recebemos seu iPhone como entrada” somente para iPhones;
- parcelamento principal com 12x como destaque;
- total do cartão subordinado visualmente;
- grid compacto de parcelas em duas colunas;
- parcelas clicáveis na própria página;
- ao selecionar 10x, 12x etc., a linha principal de parcelamento e o total atualizam;
- 12x é o estado visual preferencial;
- seleção de parcela no formulário usa seletor próprio, não select nativo;
- card de configuração foi ajustado para acomodar textos longos;
- pedido no WhatsApp recebeu link da variante e Open Graph.

## Imagem ampliável

Implementado zoom/lightbox somente na página do produto.

Regras finais:
- não exibir “Toque para ampliar”;
- lightbox menor que a viewport;
- bordas/fundo do site ficam visíveis;
- +, -, fechar e pinch/zoom;
- home NÃO abre zoom;
- imagem da home continua funcionando apenas como link para o produto.

Houve regressão em que o zoom foi aplicado também aos cards da home; foi corrigida separando `zoomable=false` no catálogo.

## Home e hero

Foi removida a linha:
“Compra assistida e disponibilidade confirmada”.

Ajustes posteriores mostraram que o degradê não pode ser cortado. Regra final:
- degradê contínuo por trás do botão e cards;
- sem faixa visível no meio;
- não remover bordas internas de cards para esconder o problema;
- cards direita/esquerda precisam do mesmo design e borda.

## Categorias do catálogo

Inicialmente iPhones vinham primeiro. Decisão mais recente:
- Androids primeiro;
- iPhones segundo;
- Androids selecionado por padrão na home;
- foco inicial de tráfego pago em Android/Xiaomi.

Outros produtos inclui perfumaria e acessórios.

## Perfumaria

Foi criada a categoria Perfumaria a partir do catálogo Guana Perfumes.

Regras comerciais:
- comissão 3,5%;
- alvo de R$47 líquidos operacionais por item;
- marketing como verba mensal;
- preço final termina em ,90;
- Admin de precificação precisa permitir selecionar categoria.

## Admin — publicação e variantes

Problema detectado:
variante podia estar `available`, mas produto em `draft`; UI mostrava “Na vitrine: 1” de forma enganosa.

Correção:
- “Disponíveis” representa variantes comercialmente disponíveis;
- “Na vitrine” representa somente as realmente publicadas;
- se variante está disponível e modelo ainda em draft, mostrar “Aguardando revisão”;
- interface deixou de usar “QA aprovado” e passou a usar “Revisado e aprovado — pode aparecer”.

Regra real de vitrine:
`catalog_status=ready` + `variant.commercial_status=available`.

## Admin — nova arquitetura da tela de produto

A tela deixou de ser um formulário enorme e virou central de gestão:
- visão do modelo;
- contagem de variantes;
- disponíveis;
- na vitrine;
- reposição;
- cores;
- situação agregada.

Filtros:
- Todas
- Disponíveis
- Reposição

Esses filtros devem funcionar localmente e não navegar para o topo.

Cada variante:
- disponibilidade sempre visível;
- detalhes recolhíveis;
- imagem;
- condição do seminovo;
- preço e margem;
- ofertas internas;
- editar cor;
- duplicar variante;
- ver na vitrine quando aplicável.

Variantes indisponíveis não precisam expor todo o formulário até serem disponibilizadas.

## Novo produto

Fluxo revisado para 5 etapas:
1. Tipo
2. Produto
3. Primeira variante
4. Comercial
5. Foto e revisão

Tipo:
- iPhone
- Android
- Outros produtos

iPhone implica Apple.
Android escolhe marca.
Outros escolhe categoria e marca.

Seminovos pedem:
- classificação;
- bateria;
- originalidade;
- nunca aberto;
- garantia;
- observações.

Novo produto nasce como rascunho.

## Nova variante

Implementado fluxo específico dentro do produto.

A nova variante herda dados do modelo e pede somente o que muda.

Foi implementada também ação de duplicar variante para casos como:
mesmo iPhone/cor/armazenamento, mas bateria diferente.

## Lista geral de produtos no Admin

Adicionados filtros:
- Todos
- iPhones
- Androids
- Outros

Busca textual continua funcionando junto do filtro.

## Pedido rápido pelo WhatsApp

O formulário coleta dados do cliente e envia mensagem pronta para o vendedor.

Mensagem do pedido foi enriquecida com emojis e hierarquia visual.

Regras finais:
- remover “Referência comercial: slug” por redundância;
- incluir cor explicitamente;
- se cor não estiver cadastrada, mostrar “Não informada”;
- link “Ver aparelho” aponta para a variante;
- preview do WhatsApp é gerado por Open Graph.

## Link compartilhável para fechamento

Implementado link direto para formulário:
`/produto/<slug>?variante=<id>&pedido=1`

Fluxo:
- vendedor abre produto;
- abre pedido rápido;
- usa “Copiar link” ou “Compartilhar”;
- cliente recebe URL;
- ao abrir, já cai no formulário da variante correta;
- ao fechar, volta para a página e `pedido=1` sai da URL.

“Copiar link” copia só a URL.
“Compartilhar” envia mensagem pronta.

## Texto social do compartilhamento

Versão final esperada:

📱✨ *Finalize seu pedido na Super Cell pelo WhatsApp*

*REDMI 17 · 8 GB RAM + 128 GB · Preto*

É simples e rápido 😊  
Abra o link abaixo, preencha seus dados e toque em *Enviar pedido pelo WhatsApp*.

*Clique aqui para finalizar seu pedido:* 👇👇👇

https://catalogo.supercellrn.com/...

### Bug importante corrigido no fim da sessão

O WhatsApp juntava os emojis e a URL mesmo com duas quebras de linha quando a Web Share API recebia:
- texto em `text`
- URL separada em `url`

A solução final foi:
- colocar a URL diretamente no final de `text`;
- NÃO usar o campo `url` para o compartilhamento;
- manter `\n\n` antes da URL.

Commit da correção:
`58126a8aeae56c0031ef6cdfd42532bf87319df8`

## Imagens no WhatsApp

O preview social depende dos metadados da página de produto.

A miniatura deve corresponder à variante sempre que possível.

O WhatsApp decide o tamanho final do card; a aplicação controla imagem, título, descrição e URL, não o layout exato do cliente WhatsApp.

## Fornecedores e importação

Fontes conhecidas:
- F1 Guanacel
- F2 Ramoncel
- F3 Mundo das Pilhas
- F4 Guana Perfumes

Quando catálogos externos têm estrutura difícil/dinâmica, usar Firecrawl para extração antes da importação; isso já resolveu problemas de produtos e imagens em importações anteriores.

## Arquivos principais mexidos nesta rodada

- `src/components/product-experience.tsx`
- `src/components/product-image.tsx`
- `src/components/catalog-grid.tsx`
- `src/app/produto/[slug]/page.tsx`
- `src/app/admin/(protected)/produtos/[id]/page.tsx`
- `src/app/admin/(protected)/produtos/page.tsx`
- `src/components/admin-new-product-wizard.tsx`
- `src/components/admin-new-variant-wizard.tsx`
- `src/components/admin-product-search.tsx`
- `src/components/admin-product-status-controls.tsx`
- `src/components/admin-variant-header.tsx`
- `src/components/admin-variant-filter.tsx`
- `src/app/globals.css`

## Estado recomendado para continuidade

Antes de qualquer nova implementação:
1. ler `SUPER-CELL-HANDOFF.md`;
2. ler este arquivo;
3. ler `docs/DEVELOPMENT-WORKFLOW.md`;
4. ler `docs/production-rules.md`;
5. confirmar head atual da `main`;
6. confirmar Vercel/Supabase;
7. seguir com branch → Preview → validação → merge.

## O que NÃO deve ser perdido no próximo chat

- Androids é a prioridade comercial inicial.
- Admin trabalha por produto/modelo + variantes.
- disponibilidade e publicação são estados diferentes.
- “QA” não deve voltar à interface.
- pedido rápido é ferramenta central de fechamento.
- link direto do pedido é parte do processo comercial via WhatsApp.
- compartilhamento deve preservar produto/configuração/cor.
- a URL do compartilhamento precisa ficar visualmente separada por duas quebras de linha.
- zoom existe só na página do produto.
- não regredir o degradê e as bordas dos cards da home.


---

## Atualização de continuidade — 14/10/2026 (conversa de implementação)

Este complemento registra o fechamento dos dois chats recentes de implementação. Os registros anteriores deste documento e do handoff continuam válidos, sujeitos à conferência com a main e produção atuais.

### Decisões de produto e UX consolidadas
- Administração: modelo e variantes separados; criação de nova variante e duplicação; disponibilidade sempre visível, demais seções (imagem, condição, preço, ofertas) recolhíveis; filtros de variantes Todas/Disponíveis/Reposição devem filtrar de fato; visão do modelo com contagens e status comercial.
- Fluxo de cadastro novo: categoria principal iPhones/Androids/Outros antes de marca, etapas de identificação/configuração/comercial/foto e revisão, campos de seminovos e seletores coerentes com design do Admin. Evitar erro de validação “Invalid input: expected string, received null”.
- Publicação do modelo (rascunho/publicado) é independente da disponibilidade da variante. Uma variante disponível não torna automaticamente visível um modelo em rascunho. O painel deve explicar essa distinção; evitar rótulo técnico “QA aprovado”.
- Admin de produtos deve oferecer filtro por iPhones, Androids e Outros, além da pesquisa textual.
- Catálogo público: Androids primeiro e selecionado inicialmente; iPhones segundo. Preservar opção de outras categorias.
- Zoom/lightbox da imagem apenas na página do produto; clique na imagem do card da home deve navegar diretamente ao produto, sem tentativa de zoom.
- Pedido rápido: mini formulário para WhatsApp, pagamento na entrega, escolha Pix/cartão, campos do cliente, endereço, referência e observações. Mensagem enviada ao vendedor com emojis e dados completos, incluindo COR; evitar linha redundante de referência/slug do produto.
- Link direto de pedido: URL do produto com variante e parâmetro pedido=1 abre formulário automaticamente. Botões de copiar e compartilhar permitem que vendedor/cliente envie link a terceiro. Preservar prévia rica do WhatsApp quando possível.

### PENDÊNCIA CONFIRMADA POR TESTE REAL — formatação do link de pedido compartilhado
Em 08/10/2026 foi mesclado o PR #28, commit `2ee04364dde9b39ab8406409672e0cdacca89961`, alterando `src/components/product-experience.tsx`, função `shareOrderLink`. A alteração tentou deixar os três emojis 👇👇👇 na mesma linha do CTA e adicionar duas quebras antes do URL.

**Resultado observado no WhatsApp pelo usuário:** o texto recebido ainda exibe os emojis na linha imediatamente anterior ao link, mas o link começa na mesma linha dos emojis; portanto, a correção **NÃO foi validada como resolvida**. Screenshot do usuário confirma. Não marcar como concluída só porque o commit foi publicado.

**Causa provável a verificar:** o código usa `navigator.share({text: shareText, url: orderLink})`. O compartilhamento nativo pode juntar `text` e `url` com sua própria separação, ignorando as quebras finais do texto. Simplesmente adicionar `\\n\\n` no final de `shareText` pode não resolver.

**Critério de aceite:** WhatsApp deve mostrar `*Clique aqui para finalizar seu pedido:* 👇👇👇`, depois uma linha em branco e então URL iniciando sozinho na linha seguinte, sem ficar colado aos dedos. Considerar incluir URL dentro do próprio `text` com `\\n\\n` entre CTA e link, e não passar `url` separado, preservando a prévia rica do produto quando possível. Testar o fluxo nativo Android/WhatsApp e fallback de cópia, sem regressão do link `pedido=1`. Confirmar a formatação por envio real antes de encerrar.

### Infraestrutura e execução
- Repositório: `tjciriaco-sys/super-cell`, branch `main`; domínio `https://catalogo.supercellrn.com`.
- Vercel projeto `prj_wRkmMrU4AvADjSW1vjGsqDcafjy7`; equipe `team_EZU9CToKIbcO6z4YxiFQc2EJ`.
- Supabase `rgbrdtstbaulxhzievkh`.
- Fluxo Plugin First: investigar no repositório, branch pequena, preview/build, PR, merge, produção, validação. Não pedir ao usuário para colar código em Work/CLI quando os plugins estão disponíveis.
- Estado temporal: commit acima foi mesclado; o último status de deploy consultado era BUILDING, portanto conferir o estado atual da Vercel antes de afirmar publicação final.
- Não editar produção para resolver apenas a documentação; este registro é um checkpoint de contexto, não uma correção funcional.

### Primeiro passo do próximo chat
Ler `SUPER-CELL-HANDOFF.md`, `docs/SESSION-CONTEXT-2026-10-08.md`, `docs/DEVELOPMENT-WORKFLOW.md`, `docs/production-rules.md`; conferir código e deploy atuais. Prioridade imediata: corrigir a separação entre os três emojis e o link no compartilhamento WhatsApp, com teste real. 
