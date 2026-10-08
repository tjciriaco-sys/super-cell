# Super Cell — Contexto Atual do Projeto

> **Fonte de continuidade para novos chats e novas execuções.**
> Atualizado em **08/10/2026** após a sequência de implementação, revisão de UX e publicação em produção realizada entre 07/10 e 08/10.
> Quando houver conflito entre documentos antigos e este arquivo, **este arquivo prevalece** para o estado atual do projeto.

---

## 1. Identidade e objetivo do produto

A Super Cell é uma **plataforma comercial mobile-first**, não um e-commerce tradicional.

Princípio de UX:

> **Comprar um celular deve ser tão simples quanto pedir uma pizza.**

O fluxo comercial é assistido:

1. cliente encontra o aparelho no catálogo;
2. visualiza preço, parcelamento, entrega e disponibilidade;
3. pode abrir o pedido rápido;
4. preenche os dados;
5. o pedido é enviado pronto para o WhatsApp;
6. o vendedor continua o atendimento e conclui a venda.

O site não substitui o vendedor nem o ERP. Ele é uma camada comercial de descoberta, qualificação e conversão.

---

## 2. Infraestrutura atual

### Repositório
- GitHub: `tjciriaco-sys/super-cell`
- Branch de produção: `main`

### Vercel
- Projeto: `super-cell`
- Project ID: `prj_wRkmMrU4AvADjSW1vjGsqDcafjy7`
- Team ID: `team_EZU9CToKIbcO6z4YxiFQc2EJ`
- Domínio público principal: `https://catalogo.supercellrn.com`

### Supabase
- Projeto: `super-cell`
- Project ID: `rgbrdtstbaulxhzievkh`
- Região: `sa-east-1`
- Estado esperado: `ACTIVE_HEALTHY`

### Stack
- Next.js 16
- React 19
- TypeScript
- Supabase
- Vercel
- Vitest / ESLint

---

## 3. Fluxo obrigatório de desenvolvimento

A Super Cell opera em **Plugin First**:

1. planejar e aprovar no chat;
2. implementar pelo plugin GitHub;
3. criar branch da tarefa;
4. validar Preview na Vercel;
5. validar tecnicamente e, quando possível, visualmente;
6. mesclar na `main`;
7. confirmar o deployment de produção;
8. nunca usar produção como ambiente de teste.

Não mandar o usuário para Work/Codex/terminal se GitHub + Vercel + Supabase já resolverem a tarefa.

Arquivos normativos relacionados:
- `docs/DEVELOPMENT-WORKFLOW.md`
- `docs/production-rules.md`
- `docs/catalog-image-standard.md`

---

## 4. Estado atual de produção

### Commit corrente da `main`
`58126a8aeae56c0031ef6cdfd42532bf87319df8`

Mensagem:
> Preserva quebra dupla antes do link compartilhado

### Deployment correspondente
- Vercel production: `dpl_3N4DKVym8mB1niLRuBiDPDg3zzxb`
- Estado confirmado: **READY**

Esse commit corrige o detalhe final do compartilhamento do pedido pelo WhatsApp: o link é incluído diretamente no texto compartilhado para preservar **duas quebras de linha** após `👇👇👇`.

---

## 5. Catálogo público — comportamento atual

### Ordem principal das categorias
A prioridade comercial atual é:

1. **Androids**
2. **iPhones**
3. **Outros produtos**

A home deve abrir com **Androids selecionado por padrão**, pois o foco inicial de tráfego pago será Android/Xiaomi.

### Outras categorias
Dentro de “Outros produtos”, a ordem operacional aprovada inclui:
1. Tablets
2. Smartwatches
3. Perfumaria
4. Cabos e carregadores
5. demais categorias secundárias existentes

A categoria **Perfumaria** foi incorporada ao ecossistema e inicialmente usa o catálogo:
`https://meucomercio.com.br/PERFUME2026`

A importação assistida de catálogos externos deve preferir ferramenta/plugin de extração web capaz de obter:
- nome;
- preço/custo;
- atributos;
- imagens;
- demais dados estruturáveis.

---

## 6. Precificação

### Smartphones / eletrônicos
Regra automática Pix por custo + acréscimo fixo:

- até R$ 500: + R$ 77
- R$ 500,01 a R$ 1.000: + R$ 97
- R$ 1.000,01 a R$ 1.500: + R$ 127
- R$ 1.500,01 a R$ 2.500: + R$ 147
- acima de R$ 2.500: + R$ 197

Custos operacionais típicos:
- comissão smartphone: 1% do Pix;
- entrega: R$ 15;
- embalagem: R$ 1;
- marketing tratado fora da unidade como verba mensal.

### Perfumaria
A perfumaria possui regra própria:
- comissão do vendedor: **3,5%**;
- resultado líquido alvo por item: **R$ 47**;
- preço Pix deve terminar em **R$ x,90**;
- o Admin de precificação precisa diferenciar a categoria para aplicar a regra correta.

Não reutilizar automaticamente a comissão de smartphones para perfumaria.

---

## 7. Parcelamento

O sistema é data-driven por adquirente.

Comportamento comercial atual:
- Pix é o preço-base exibido;
- parcelamento principal destaca **quantidade de parcelas + valor da parcela**;
- total no cartão permanece visível, mas subordinado;
- 12x é a opção comercialmente destacada por padrão;
- cliente pode abrir “Ver todas as parcelas”;
- grade compacta em duas colunas;
- clicar em uma parcela na página do produto:
  - seleciona a opção;
  - atualiza parcela principal e total;
  - fecha o menu automaticamente após pequena confirmação visual;
- no formulário de pedido, o seletor de parcelas é próprio, não um select nativo.

---

## 8. Página de produto — estado consolidado

A página do produto possui:

- imagem principal;
- badges;
- nome do modelo;
- configuração;
- bateria para seminovos;
- preço Pix;
- parcelamento;
- grade de todas as parcelas;
- card de entrada de iPhone quando aplicável;
- CTA “Enviar pedido pelo WhatsApp”;
- aviso de pagamento somente na entrega;
- CTA “Falar com um vendedor”;
- card da próxima rota;
- contador;
- principais destaques;
- ficha técnica.

### Configuração
O card “Configuração” foi ajustado para não estourar o texto no mobile.

### Entrada de iPhone
“Recebemos seu iPhone como entrada”:
- aparece somente em iPhones;
- não aparece em Androids.

### Zoom da imagem
O zoom existe **somente na página do produto**.

Comportamento:
- clicar na imagem abre uma lightbox na mesma página;
- não abre nova guia;
- o catálogo continua visível ao fundo;
- bordas da página permanecem perceptíveis;
- controles de +, − e fechar;
- suporte à ampliação por gesto do navegador;
- texto “Toque para ampliar” foi removido.

**Importante:** a home NÃO deve usar o zoom. Nos cards da home, clicar na imagem deve apenas navegar para a página do produto.

---

## 9. Pedido rápido e WhatsApp

### Formulário
O botão “Enviar pedido pelo WhatsApp” abre uma lightbox/formulário dentro do site.

Campos atuais:
- forma de pagamento;
- parcelas quando cartão;
- nome;
- endereço;
- ponto de referência;
- observações.

### Link direto do formulário
Foi implementado um link compartilhável com o padrão:

`/produto/<slug>?variante=<variant-id>&pedido=1`

Ao abrir:
- carrega o produto;
- preserva a variante exata;
- abre automaticamente o formulário “Finalize pelo WhatsApp”.

Ao fechar:
- remove `pedido=1`;
- preserva a variante selecionada.

### Ações no topo do formulário
- **Copiar link**: copia apenas o link puro;
- **Compartilhar**: usa o compartilhamento nativo do celular quando disponível.

### Texto social do compartilhamento
A mensagem aprovada segue esta hierarquia:

```
📱✨ *Finalize seu pedido na Super Cell pelo WhatsApp*

*<PRODUTO> · <CONFIGURAÇÃO> · <COR>*

É simples e rápido 😊
Abra o link abaixo, preencha seus dados e toque em *Enviar pedido pelo WhatsApp*.

*Clique aqui para finalizar seu pedido:* 👇👇👇

<LINK>
```

**Regra crítica:** devem existir **duas quebras de linha** entre `👇👇👇` e o link.  
O WhatsApp não preservou corretamente esse espaço quando a URL foi enviada separadamente via Web Share. Por isso o commit `58126a8...` passou a inserir a URL diretamente dentro do texto compartilhado.

### Pedido enviado ao vendedor
A mensagem final enviada pelo formulário usa emojis como marcadores visuais.

Estrutura aproximada:

```
🛒 *NOVO PEDIDO — SUPER CELL*

📱 *Produto:* ...
💾 *Configuração:* ...
🎨 *Cor:* ...
🔋 *Bateria:* ...        [quando aplicável]
✨ *Condição:* ...       [quando aplicável]
🚚 *Entrega:* ...

💳 *Pagamento:* ...
💰 *Valor:* ...
🧾 *Total:* ...

👤 *Cliente:* ...
📍 *Endereço:* ...
📌 *Referência:* ...
📝 *Observação:* ...

🔗 *Ver aparelho:*
<link normal da variante>

✅ Pedido originado pela *Plataforma Super Cell*.
```

### Regras do texto do pedido
- cor é indispensável;
- a antiga “Referência comercial: slug” foi removida por ser redundante;
- se a variante não tiver cor cadastrada, mostrar “Cor: Não informada” em vez de omitir silenciosamente;
- o link “Ver aparelho” deve apontar para a variante normal, sem `pedido=1`;
- a prévia Open Graph do WhatsApp deve continuar funcionando.

---

## 10. Open Graph / prévia no WhatsApp

A página de produto produz metadata específica da variante.

Objetivo:
- prévia do WhatsApp com a imagem correta da variante;
- título do modelo;
- configuração;
- cor;
- preço Pix;
- “até 18x”;
- “pagamento na entrega”.

A imagem usada no pedido deve refletir a variante exibida, não uma capa incorreta ou genérica quando houver imagem própria válida.

---

## 11. Admin — arquitetura atual

O Admin deixou de ser um formulário longo e passou a caminhar para uma **central operacional de gestão de variantes**.

### Tela de edição do produto
Cabeçalho:
- nome do produto;
- marca / categoria / condição / conectividade;
- estado de publicação em linguagem humana;
- botão **Nova variante**.

### Dashboard do modelo
Exibe:
- número total de variantes;
- número de variantes comercialmente disponíveis;
- número efetivamente **na vitrine**;
- número em reposição;
- cores cadastradas;
- estado comercial agregado.

### Publicação
Não usar “QA aprovado” na interface cotidiana.

Linguagem atual:
- **Rascunho — oculto da vitrine**
- **Revisado e aprovado — pode aparecer**

Regra conceitual:
- variante `available` = pronta comercialmente;
- produto `ready` = cadastro do modelo revisado e liberado para publicação;
- só entra de fato na vitrine quando ambos são verdadeiros.

Quando a variante está disponível, mas o produto está em rascunho:
- não mostrar simplesmente “Fora da vitrine”;
- mostrar **Aguardando revisão**.

### Filtros locais de variantes
Na página de produto:
- Todas
- Disponíveis
- Reposição

Esses filtros devem acontecer **localmente**, sem navegação/reload e sem jogar a página para o topo.

### Ordenação
Variantes disponíveis devem aparecer antes das variantes em reposição/ocultas.

### Cards das variantes
Disponibilidade fica sempre visível.

Quando a variante estiver indisponível/reposição:
- mostrar essencialmente o estado e as ações necessárias;
- não obrigar o usuário a atravessar todos os detalhes.

Quando disponível:
- detalhes podem ser expandidos em grupos recolhíveis.

Grupos:
- imagem;
- condição do seminovo;
- preço e margem;
- ofertas internas.

### Cor
A edição da cor fica próxima ao cabeçalho da variante, não enterrada no fim do formulário.

### Visualização
O acesso “Ver na vitrine” pertence à **variante**, não ao produto genérico.

### Duplicar variante
Existe ação **Duplicar variante**, útil para unidades semelhantes com diferenças individuais como:
- bateria;
- foto;
- custo;
- SKU;
- cor;
- condição.

---

## 12. Novo produto — wizard atual

O wizard foi redesenhado para refletir a lógica real da plataforma.

### Etapa 1 — Tipo
A decisão principal é comercial:

- iPhone
- Android
- Outros produtos

Regras:
- iPhone implica Apple;
- Android pede marca depois;
- Outros pede categoria + marca.

### Etapa 2 — Produto
Dados comuns:
- modelo;
- condição;
- conectividade;
- descrição comercial.

### Etapa 3 — Primeira variante
Dados específicos da unidade:
- armazenamento;
- RAM;
- cor comercial;
- cor visual;
- SIM;
- SKU;
- para seminovo: classificação, bateria, originalidade, abertura, garantia e observações.

### Etapa 4 — Comercial
- fornecedor;
- custo;
- código externo;
- preço Pix manual opcional;
- disponibilidade da variante.

### Etapa 5 — Foto e revisão
- foto;
- revisão;
- criação do produto + primeira variante + oferta.

### Regra de publicação
Produto novo nasce como **rascunho**.

---

## 13. Nova variante — wizard próprio

Dentro de um produto existente existe **Nova variante**.

Ela herda:
- marca;
- categoria;
- modelo;
- condição;
- conectividade.

E pede somente o que pode variar:
- armazenamento;
- RAM;
- cor;
- SIM;
- SKU;
- condição individual;
- bateria;
- originalidade;
- garantia;
- custo;
- fornecedor;
- preço manual;
- disponibilidade;
- foto.

A criação volta para a central do produto.

---

## 14. Seminovos

Seminovos são tratados por unidade/variante.

Dados importantes:
- saúde da bateria;
- classificação;
- originalidade;
- se foi aberto;
- garantia;
- observações;
- foto real da unidade.

Exemplo de uso:
um iPhone 13 Pro 128 GB Grafite 85% e outro igual com 90% são **variantes distintas**, mesmo se modelo/cor/armazenamento coincidirem.

A foto real com etiqueta técnica é parte importante da credibilidade comercial e deve poder ser ampliada na página pública.

---

## 15. Lista geral de produtos no Admin

Existe busca textual e agora também filtros principais:

- Todos
- iPhones
- Androids
- Outros

A busca e o filtro devem funcionar em conjunto.

---

## 16. Perfumaria

A categoria Perfumaria foi adicionada ao ecossistema da Super Cell.

Fornecedor inicial:
- **F4 · Guana Perfumes**

A lógica de cadastro segue a mesma arquitetura de produto/variante/oferta, mas com pricing mode próprio.

A categoria é também um possível braço comercial da operação Super Cheiros.

---

## 17. Fornecedores conhecidos

- F1 · Guanacel
- F2 · Ramoncel
- F3 · Mundo das Pilhas
- F4 · Guana Perfumes

Estrutura de domínio:
**Modelo → Variante → Oferta de fornecedor → Fonte comercial → Preço Super Cell**

O menor custo válido pode ser escolhido automaticamente, salvo fixação manual.

---

## 18. Logística

A página pública trabalha com rotas e cortes.

Regra consolidada:
- pedidos até 09:00 → rota 10:00;
- pedidos até 13:00 → rota 14:00;
- pedidos até 17:00 → rota 18:00.

A página deve apresentar:
- próxima rota;
- horário de fechamento;
- contador;
- próxima alternativa no mesmo dia quando houver;
- pagamento na entrega.

---

## 19. Imagens

Regras principais:
- a imagem pública pode ser por variante;
- variantes seminovas podem ter imagem individual real;
- upload pelo Admin usa Supabase Storage;
- JPEG, PNG ou WebP;
- limite operacional atual: 5 MB;
- imagem do catálogo/home é link para a página;
- imagem da página do produto pode abrir lightbox;
- não fundir imagens de unidades diferentes quando isso eliminar informação real da unidade.

---

## 20. Regras de UX que não devem regredir

### Público
- mobile first;
- foco em 360–430 px;
- não introduzir selects nativos quando já existe componente visual próprio;
- parcelas devem priorizar “12x de R$ ...” e não o total;
- total permanece visível;
- CTA de WhatsApp é primário;
- evitar saltos inesperados de scroll;
- home deve começar em Androids;
- imagem da home não tem zoom;
- imagem do produto tem zoom;
- formulário de pedido abre dentro da página;
- link direto de pedido deve abrir o formulário da variante correta.

### Admin
- evitar formulários gigantes completamente abertos;
- mostrar primeiro estado operacional;
- revelar detalhes sob demanda;
- disponibilidade sempre visível;
- disponível ≠ publicado;
- mensagens de erro devem ser humanas;
- botões devem dar feedback de ação;
- variante é a unidade operacional real.

---

## 21. Correções importantes realizadas recentemente

Principais commits relevantes da sequência de 07–08/10:

- `c7891707...` — refinamento inicial de troca de iPhone e parcelamento.
- `42d9df1e...` — reorganização de variantes e zoom inicial da imagem.
- `b91b610c...` — lightbox menor e catálogo visível ao fundo.
- `c609cf2e...` — redesign de cadastro de produto e gestão de variantes.
- `4b0b254b...` — zoom removido da home e restrito à página do produto.
- `50d4c3bc...` — distinção publicação/disponibilidade, filtros Admin e pedido WhatsApp enriquecido.
- `3cc37dad...` — Androids como primeira categoria e default da home.
- `a62b8ae4...` — cor obrigatória no texto do pedido e remoção da referência comercial redundante.
- `bf40c980...` — link compartilhável do pedido rápido.
- `2b9901ae...` — enriquecimento social do texto de compartilhamento.
- `2ee04364...` — ajuste visual dos emojis de chamada.
- `58126a8a...` — correção final para preservar duas quebras de linha antes do link no WhatsApp.

---

## 22. Incidente/lesson learned — lightbox e home

Ao reutilizar o componente de imagem com zoom no catálogo, o clique da home começou a:
1. tentar abrir o zoom;
2. navegar para a página.

Isso causou sensação de defeito.

Regra definitiva:
- `ProductImage` pode ter comportamento configurável;
- home usa `zoomable=false`;
- página do produto usa zoom.

---

## 23. Incidente/lesson learned — publicação

Caso observado no iPhone 13:
- variante marcada disponível;
- dashboard inicialmente dizia “Na vitrine: 1”;
- produto ainda estava em rascunho;
- catálogo não mostrava o aparelho.

Correção conceitual:
- contar “Na vitrine” somente se o produto estiver revisado/aprovado;
- separar disponibilidade comercial de publicação;
- mostrar “Aguardando revisão” quando o bloqueio for o status do modelo.

---

## 24. Incidente/lesson learned — filtros

Os filtros de variantes inicialmente eram links com query string e causavam recarga/salto para o topo.

Regra definitiva:
- filtros de variante devem ser locais e instantâneos;
- não navegar nem reposicionar o usuário.

---

## 25. Contexto comercial de aquisição

Objetivo dos anúncios:
- iniciar conversas no WhatsApp;
- não tentar fechar tudo dentro do anúncio.

Jornada:
**Meta Ads → WhatsApp → atendimento/funil → qualificação → oferta → follow-up de nutrição → fechamento.**

Leads silenciosos não são descartados; entram em nutrição com:
- mensagens;
- vídeos;
- depoimentos;
- provas sociais;
- ofertas posteriores.

O catálogo deve servir como apoio comercial nessa jornada.

---

## 26. Decisão adjacente sobre ERP / X1 Commerce

Discussão intermediária do projeto definiu:

- Super Cell/X1 Commerce **não deve virar um ERP concorrente**;
- o ERP atual continua sendo a fonte operacional oficial;
- uma futura camada própria pode sincronizar pedidos periodicamente;
- objetivo: backup interno + histórico + BI;
- sincronização pode ser diária ou manual;
- arquitetura desejada: espelho bruto + base analítica normalizada;
- V1 dessa camada não deve tentar substituir estoque, financeiro, comissão ou expedição operacional.

Essa decisão é adjacente e **não deve ser confundida com o escopo atual do repositório Super Cell**.

---

## 27. Arquivos principais para retomada técnica

### Público
- `src/app/page.tsx`
- `src/app/produto/[slug]/page.tsx`
- `src/components/catalog-grid.tsx`
- `src/components/product-experience.tsx`
- `src/components/product-image.tsx`
- `src/components/installments.tsx`

### Admin
- `src/app/admin/(protected)/produtos/page.tsx`
- `src/app/admin/(protected)/produtos/[id]/page.tsx`
- `src/app/admin/(protected)/produtos/[id]/nova-variante/page.tsx`
- `src/components/admin-new-product-wizard.tsx`
- `src/components/admin-new-variant-wizard.tsx`
- `src/components/admin-product-status-controls.tsx`
- `src/components/admin-variant-header.tsx`
- `src/components/admin-variant-availability.tsx`
- `src/components/admin-product-image-upload.tsx`

### Regras
- `src/lib/pricing.ts`
- `src/lib/data.ts`
- `src/app/globals.css`
- `docs/production-rules.md`

---

## 28. Banco / modelo mental

A entidade principal comercial não é “produto com todas as cores misturadas”.

Estrutura correta:

**Produto/Modelo**
→ **Variante**
→ **Oferta de fornecedor**

A variante representa uma unidade/configuração comercial real.

Informações que podem ser específicas da variante:
- cor;
- RAM;
- armazenamento;
- bateria;
- condição;
- foto;
- SKU;
- SIM;
- preço manual;
- disponibilidade;
- fornecedor/ofertas.

Não fundir unidades quando isso destruir diferenças comerciais reais.

---

## 29. Checklist para um novo chat antes de modificar código

1. Ler este arquivo.
2. Ler `docs/production-rules.md`.
3. Conferir o último commit da `main`.
4. Conferir deploy de produção na Vercel.
5. Usar GitHub + Vercel + Supabase diretamente.
6. Criar branch específica para alteração.
7. Preservar as regras de variante/publicação/WhatsApp.
8. Validar Preview antes de merge.
9. Não redesenhar áreas aprovadas sem pedido explícito.
10. Registrar decisões estruturais novas neste arquivo.

---

## 30. Estado de pendências ao fechar este contexto

No momento desta atualização:
- commit `58126a8aeae56c0031ef6cdfd42532bf87319df8` está em produção e READY;
- correção das duas quebras de linha do compartilhamento foi incorporada;
- não há bug conhecido bloqueador registrado após esse commit;
- próximos trabalhos devem partir da `main` atual, nunca de branches antigas;
- antes de qualquer alteração visual, considerar os prints recentes do usuário como referência de homologação.

