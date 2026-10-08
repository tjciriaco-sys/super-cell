# Super Cell — Handoff atual

> Última consolidação: 08/10/2026  
> Repositório: `tjciriaco-sys/super-cell`  
> Branch padrão: `main`  
> Produção: `https://catalogo.supercellrn.com`  
> Commit de referência no momento desta consolidação: `58126a8aeae56c0031ef6cdfd42532bf87319df8`

Este documento substitui o antigo handoff pré-lançamento. Ele deve ser lido primeiro ao retomar o projeto em outro chat.

## 1. Objetivo do produto

A Super Cell é uma plataforma comercial mobile-first para venda assistida de smartphones e eletrônicos. Não é um e-commerce tradicional. O objetivo é facilitar descoberta, comparação, simulação de parcelamento e fechamento pelo WhatsApp.

Princípio de UX: **“Comprar um celular deve ser tão simples quanto pedir uma pizza.”**

## 2. Stack e infraestrutura

- Next.js + TypeScript.
- React.
- Supabase como backend, banco, Auth e Storage.
- Vercel para Preview e produção.
- GitHub como fonte de verdade do código.
- Domínio público: `catalogo.supercellrn.com`.
- Projeto Supabase: `rgbrdtstbaulxhzievkh`.
- Projeto Vercel: `prj_wRkmMrU4AvADjSW1vjGsqDcafjy7`.
- Time Vercel: `team_EZU9CToKIbcO6z4YxiFQc2EJ`.

## 3. Método de desenvolvimento

Seguir `docs/DEVELOPMENT-WORKFLOW.md`.

Fluxo padrão:
1. entender e confirmar a mudança;
2. implementar via plugin GitHub;
3. gerar/validar Preview na Vercel;
4. homologar;
5. mesclar para `main`;
6. validar produção.

O chat atual é o ambiente normal de implementação. Work/Codex não é o padrão quando os plugins resolvem a tarefa.

## 4. Catálogo público

### Categorias principais
Ordem atual:
1. **Androids**
2. **iPhones**
3. **Outros produtos**

Ao abrir a home, **Androids é a categoria selecionada por padrão** quando há Androids disponíveis.

Em “Outros produtos”, a organização atual prioriza:
- Tablets
- Smartwatches
- Perfumaria
- Projetores
- Receptores
- Cabos e carregadores
- Caixas de som
- Fones de ouvido
- Power banks

### Perfumaria
Fonte inicial: catálogo Guana Perfumes.

Regras comerciais atuais da perfumaria:
- comissão do vendedor: **3,5%**;
- lucro operacional alvo: **R$ 47 por item** depois dos custos considerados;
- verba de tráfego continua como marketing mensal, fora do custo unitário;
- preços devem terminar em **R$ x,90**;
- a categoria tem precificação própria no Admin.

### Precificação de celulares
Regra automática Pix por custo:
- até R$ 500: + R$ 77
- R$ 500,01–1.000: + R$ 97
- R$ 1.000,01–1.500: + R$ 127
- R$ 1.500,01–2.500: + R$ 147
- acima de R$ 2.500: + R$ 197

Custos operacionais considerados no modelo tradicional:
- comissão 1% do Pix;
- entrega R$ 15;
- embalagem R$ 1;
- marketing fora da unidade.

## 5. Modelo de dados comercial

Estrutura conceitual:
**Produto/Modelo → Variante → Oferta de fornecedor → Fonte comercial → Preço Super Cell**

Regras importantes:
- cada variante representa uma unidade/configuração comercial distinta;
- cor, bateria, armazenamento, RAM, condição e outros dados podem distinguir variantes;
- iPhones seminovos podem ter variantes com mesma cor/armazenamento e bateria diferente;
- fornecedor concorrente entra como oferta da variante quando tecnicamente equivalente;
- disponibilidade pública depende da variante e do estado de publicação do produto.

## 6. Estados de publicação e disponibilidade

Há duas dimensões diferentes:

### Produto / modelo
- `draft` = **Rascunho — oculto da vitrine**
- `ready` = **Revisado e aprovado — pode aparecer**

O termo “QA aprovado” foi removido da interface por ser técnico demais. Internamente o conceito continua sendo revisão final antes da publicação.

### Variante
- `available` = disponível comercialmente;
- `restocking` = aguardando reposição;
- `hidden` = oculta.

Uma variante só aparece de verdade na vitrine quando:
**produto revisado/aprovado + variante disponível**.

Na interface do Admin:
- “Disponíveis” ≠ “Na vitrine”;
- variante disponível com produto ainda em rascunho mostra **“Aguardando revisão”**;
- reposição/oculta mostra **“Fora da vitrine”**.

## 7. Admin — gestão de produtos e variantes

A tela de edição de produto foi transformada em uma central operacional.

### Topo / visão do modelo
Mostra:
- quantidade de variantes;
- quantidade disponíveis;
- quantidade efetivamente na vitrine;
- quantidade em reposição;
- cores cadastradas;
- situação comercial agregada.

### Variantes
- variantes disponíveis aparecem primeiro;
- filtros locais: **Todas / Disponíveis / Reposição**;
- os filtros não devem navegar para o topo nem recarregar a página;
- disponibilidade é sempre visível;
- detalhes só aparecem quando necessários;
- variante em reposição/oculta não expõe todo o formulário de edição até ser disponibilizada.

### Ações
- **Nova variante**
- **Duplicar variante**
- **Editar cor**
- **Ver na vitrine** somente quando publicável.

### Nova variante
O fluxo herda do produto:
- marca;
- categoria;
- modelo;
- conectividade;
- condição geral.

E pede só o que muda na unidade:
- armazenamento;
- RAM;
- cor;
- SIM;
- SKU;
- condição;
- bateria;
- originalidade;
- garantia;
- fornecedor;
- custo;
- preço manual, se necessário;
- disponibilidade;
- foto.

## 8. Novo produto

O wizard foi redesenhado para 5 etapas:

1. **Tipo**
   - iPhone
   - Android
   - Outros produtos

2. **Produto**
   - modelo
   - condição
   - conectividade
   - descrição

3. **Primeira variante**
   - armazenamento
   - RAM
   - cor
   - SIM
   - SKU
   - dados específicos de seminovo

4. **Comercial**
   - fornecedor
   - custo
   - código externo
   - preço manual opcional
   - disponibilidade

5. **Foto e revisão**

Regras:
- iPhone implica Apple;
- Android escolhe marca depois;
- Outros escolhe categoria e marca;
- produto novo nasce como rascunho;
- campos opcionais aceitam vazio sem erro técnico genérico;
- selects principais devem usar a linguagem visual própria do Admin, não dropdown nativo quando houver componente próprio.

## 9. Seminovos

Dados da variante podem incluir:
- classificação;
- saúde da bateria;
- componentes originais;
- nunca aberto;
- garantia;
- observações.

A bateria é individual da variante e não deve ser usada para fundir unidades diferentes.

O Admin deve deixar claro quando a variante está pronta para venda, em reposição ou aguardando revisão do modelo.

## 10. Página pública do produto

A página do produto é mobile-first e mantém:
- imagem;
- nome;
- condição;
- badges;
- configuração;
- bateria quando aplicável;
- Pix;
- parcelamento;
- CTA de pedido;
- CTA para vendedor;
- logística/rota;
- destaques;
- ficha técnica.

### Parcelamento
- Pix é fixo;
- destaque comercial inicial é 12x;
- o cliente pode abrir todas as parcelas;
- grade de parcelas é interativa;
- ao tocar em outra quantidade, parcela e total são atualizados;
- 12x fica visualmente destacado por padrão;
- após escolher uma parcela, a grade deve recolher automaticamente depois de uma fração curta de tempo;
- no formulário do pedido há seletor visual próprio de parcelas.

### Trade-in
O card **“Recebemos seu iPhone como entrada”** aparece somente para iPhones.

## 11. Zoom da imagem

Zoom existe **somente na página do produto**.

Na home/catalog grid:
- tocar na imagem deve somente abrir a página do produto;
- não abrir lightbox.

Na página do produto:
- tocar na imagem abre lightbox interna;
- não abrir nova aba;
- manter o catálogo visível nas bordas;
- controles +, -, fechar;
- suporte a zoom/pinça;
- não exibir o texto “Toque para ampliar”.

## 12. Pedido rápido pelo WhatsApp

O formulário abre dentro da página do produto e coleta:
- forma de pagamento;
- parcelas quando cartão;
- nome;
- endereço;
- ponto de referência;
- observações.

A mensagem para o vendedor deve ser visual e social, com emojis como marcadores.

Estrutura atual esperada:
- 🛒 NOVO PEDIDO — SUPER CELL
- 📱 Produto
- 💾 Configuração
- 🎨 Cor
- 🔋 Bateria, quando aplicável
- ✨ Condição, quando aplicável
- 🚚 Entrega
- 💳 Pagamento
- 💰 Valor/parcela
- 🧾 Total
- 👤 Cliente
- 📍 Endereço
- 📌 Referência
- 📝 Observação
- 🔗 Ver aparelho
- ✅ Pedido originado pela Plataforma Super Cell

Regras:
- **não enviar slug/referência comercial redundante**;
- **cor é obrigatória no corpo da mensagem**; se faltar no cadastro, exibir “Não informada”;
- o link “Ver aparelho” deve apontar para a variante correta.

## 13. Link compartilhável do pedido

O pedido rápido possui URL própria sem criar uma página separada.

Formato:
`/produto/<slug>?variante=<variant-id>&pedido=1`

Comportamento:
- abrir a URL carrega a página do produto;
- preserva a variante;
- abre automaticamente o formulário;
- ao fechar, remove `pedido=1` e mantém a variante;
- se a variante do link não estiver mais disponível, não deve abrir o formulário como se estivesse tudo normal.

No topo do formulário:
- **Copiar link** = copia somente a URL;
- **Compartilhar** = usa compartilhamento nativo quando disponível.

### Texto social de compartilhamento
Versão atual aprovada:

📱✨ *Finalize seu pedido na Super Cell pelo WhatsApp*

*<PRODUTO> · <CONFIGURAÇÃO> · <COR>*

É simples e rápido 😊  
Abra o link abaixo, preencha seus dados e toque em *Enviar pedido pelo WhatsApp*.

*Clique aqui para finalizar seu pedido:* 👇👇👇

<LINK DO PEDIDO>

**Detalhe crítico:** o WhatsApp estava ignorando a separação visual quando a URL era enviada pelo campo `url` da Web Share API. A correção atual inclui o link **dentro do texto compartilhado** e deixa **duas quebras de linha** entre os três dedos e a URL.

Commit que corrigiu isso:
`58126a8aeae56c0031ef6cdfd42532bf87319df8`

## 14. Prévia de link no WhatsApp

A página do produto usa metadados Open Graph para gerar preview.

Objetivo:
- mostrar a imagem correta da variante;
- nome do produto;
- configuração/cor/preço;
- pagamento na entrega;
- manter preview compacto dentro das limitações do WhatsApp.

Não controlar tamanho exato do card do WhatsApp: ele é decidido pelo próprio WhatsApp.

## 15. Home

Princípios visuais importantes:
- manter o degradê contínuo do hero para os cards de benefícios;
- não criar faixa/linha aparente entre botão principal e cards;
- cards da esquerda e direita devem ter exatamente o mesmo tratamento de borda;
- não remover bordas internas para mascarar linha de fundo.

CTA principal:
**Escolher meu celular**

Benefícios:
- Pagamento somente na entrega
- Entrega grátis no mesmo dia
- Mais de 50 cidades do RN
- Pix ou até 18x

A antiga linha “Compra assistida e disponibilidade confirmada” foi removida.

## 16. Fornecedores

Principais fontes:
- F1 Guanacel
- F2 Ramoncel
- F3 Mundo das Pilhas
- F4 Guana Perfumes

Guana Perfumes tem catálogo próprio e alimenta a categoria Perfumaria.

Para importação de catálogos externos dinâmicos, o fluxo que funcionou melhor usa **Firecrawl** para extrair estrutura, produtos e imagens antes da consolidação no Supabase.

## 17. Imagens

- Storage público de leitura: `product-images`.
- escrita restrita ao Admin.
- JPEG, PNG e WebP até 5 MB.
- imagens reais de variantes são preferidas para seminovos.
- variações com imagem própria devem manter a imagem correta na vitrine, página e metadados.
- imagem de uma variante não deve sobrescrever indiscriminadamente outra cor/unidade.

## 18. Arquivos centrais do código

- `src/components/product-experience.tsx` — página do produto, parcelamento, pedido rápido, WhatsApp, compartilhamento.
- `src/components/product-image.tsx` — imagem e lightbox.
- `src/components/catalog-grid.tsx` — home/catalog grid e categorias.
- `src/app/produto/[slug]/page.tsx` — carregamento de variante e metadata.
- `src/app/admin/(protected)/produtos/[id]/page.tsx` — central de gestão do produto.
- `src/components/admin-new-product-wizard.tsx` — novo produto.
- `src/components/admin-new-variant-wizard.tsx` — nova variante.
- `src/components/admin-product-search.tsx` — busca/filtros da lista.
- `src/lib/pricing.ts` — regras de preço.

## 19. Situação atual e próximo chat

Ao abrir um novo chat:
1. dizer que é continuação da Super Cell;
2. pedir para ler `SUPER-CELL-HANDOFF.md`;
3. pedir para respeitar `docs/DEVELOPMENT-WORKFLOW.md` e `docs/production-rules.md`;
4. continuar pela `main`;
5. validar GitHub/Vercel/Supabase antes de implementar;
6. não voltar para Work como padrão.

O contexto detalhado da rodada de 07–08/10/2026 está em:
`docs/SESSION-CONTEXT-2026-10-08.md`.
