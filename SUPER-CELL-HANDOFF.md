# Super Cell — contexto operacional consolidado

> Última atualização: 08/10/2026
> Fonte de verdade técnica: GitHub `tjciriaco-sys/super-cell` → branch `main`
> Produção: `https://catalogo.supercellrn.com`
> Backend: Supabase `rgbrdtstbaulxhzievkh` (`super-cell`, sa-east-1)
> Deploy: Vercel project `super-cell`
> Estado de produção validado no momento deste handoff: commit `58126a8aeae56c0031ef6cdfd42532bf87319df8`, deployment READY.

---

## 1. Objetivo do projeto

A Super Cell é uma plataforma comercial mobile-first para smartphones e eletrônicos. Não é um e-commerce clássico: a página ajuda o cliente a escolher o produto, entender preço/parcelamento, logística e condições comerciais e, no fechamento, leva o pedido para o WhatsApp.

Princípio de UX: **“Comprar um celular deve ser tão simples quanto pedir uma pizza.”**

A operação é orientada a:
- catálogo simples;
- preço transparente;
- parcelamento forte;
- pedido via WhatsApp;
- pagamento na entrega;
- administração de produtos/variantes/fornecedores pelo painel interno;
- atualização rápida de produtos e imagens pelo celular.

---

## 2. Fluxo obrigatório de desenvolvimento

Padrão atual: **Plugin First**.

1. Chat confirma entendimento/escopo.
2. GitHub é a fonte de código.
3. Alterações relevantes são feitas por branch/PR quando apropriado.
4. Vercel gera Preview.
5. Preview é validado.
6. Após aprovação, merge para `main`.
7. Git integration dispara Production.
8. Supabase é alterado somente quando a mudança realmente exigir dados/schema/storage/auth.

Não voltar automaticamente ao fluxo antigo de Work/Codex com blocos para copiar. O usuário prefere que o Chat implemente diretamente pelos plugins GitHub/Supabase/Vercel quando possível.

Não alterar produção sem autorização explícita. Para UI/UX, preferir branch → Preview → validação → merge.

---

## 3. Stack e infraestrutura

- Next.js 16.3.6 / App Router
- React 19
- TypeScript
- Tailwind CSS 4 + CSS global próprio
- Supabase
- Vercel
- GitHub

### IDs técnicos atuais

GitHub:
- Repo: `tjciriaco-sys/super-cell`
- Branch principal: `main`

Vercel:
- Team ID: `team_EZU9CToKIbcO6z4YxiFQc2EJ`
- Project ID: `prj_wRkmMrU4AvADjSW1vjGsqDcafjy7`
- Project: `super-cell`
- Domínio público: `catalogo.supercellrn.com`

Supabase:
- Project ref: `rgbrdtstbaulxhzievkh`
- Status no momento deste handoff: `ACTIVE_HEALTHY`
- Região: `sa-east-1`
- PostgreSQL 17

Não registrar secrets neste arquivo.

---

## 4. Arquitetura comercial do catálogo

Hierarquia principal:

**Modelo → Variante → Oferta de fornecedor → Fonte comercial ativa → Preço Super Cell**

Uma variante é uma unidade comercial independente quando atributos relevantes mudam, especialmente:
- cor;
- armazenamento;
- RAM;
- bateria;
- condição;
- SKU;
- custo;
- fornecedor/oferta.

Para seminovos, unidades com bateria/custo diferentes **não devem ser fundidas**.

### Disponibilidade

A disponibilidade pública é controlada por variante.

Estados principais de variante:
- `available`
- `restocking`
- `hidden`

O status do modelo é agregado pelas variantes.

### Publicação

Há duas travas diferentes:

1. **Variante disponível** = comercialmente pronta.
2. **Modelo revisado e aprovado** = autorizado a aparecer publicamente.

Somente com as duas condições a variante entra na vitrine.

A antiga expressão visual “QA aprovado” foi substituída por:
**“Revisado e aprovado — pode aparecer”**.

Se a variante estiver disponível, mas o modelo ainda estiver em rascunho, o card deve mostrar:
**“Aguardando revisão”**
e não simplesmente “Fora da vitrine”.

---

## 5. Categorias e prioridade atual da home

A ordem comercial atual da vitrine principal é:

1. **Androids**
2. **iPhones**
3. **Outros produtos**

Androids devem abrir selecionados por padrão ao entrar no catálogo, quando existirem aparelhos Android disponíveis.

A categoria “Outros produtos” inclui a grade:
- Tablets
- Smartwatches
- Perfumaria
- Cabos e carregadores
- Projetores
- Receptores
- Caixas de som
- Fones de ouvido
- Power banks

A Super Cell passou a dar prioridade inicial de tráfego pago a Androids/Xiaomi.

---

## 6. Fornecedores e catálogos

### F1 Guanacel
Fonte principal para smartphones Xiaomi/Redmi/POCO e outros itens.

Catálogo conhecido:
`https://meucomercio.com.br/GUANACELL08`

### iPhones seminovos
Podem vir de listas WhatsApp e outras fontes do fornecedor.

### F2 Ramoncel
Fornecedor secundário com listas próprias.

### F3 Mundo das Pilhas
Fornecedor cadastrado no Admin.

### F4 Guana Perfumes
Catálogo:
`https://meucomercio.com.br/PERFUME2026`

Para extrações/importações de catálogos web, o fluxo que funcionou melhor anteriormente foi usar **Firecrawl**, inclusive para obter dados e imagens. Evitar voltar a tentativas manuais frágeis quando Firecrawl estiver disponível.

---

## 7. Precificação

### Smartphones / eletrônicos — Pix automático

Regra oficial:
**CUSTO + ACRÉSCIMO FIXO**

Faixas:
- até R$ 500,00 → + R$ 77
- R$ 500,01 a R$ 1.000,00 → + R$ 97
- R$ 1.000,01 a R$ 1.500,00 → + R$ 127
- R$ 1.500,01 a R$ 2.500,00 → + R$ 147
- acima de R$ 2.500,00 → + R$ 197

Custos considerados:
- comissão padrão: 1% do Pix;
- entrega: R$ 15;
- embalagem: R$ 1;
- marketing/tráfego: verba mensal, fora do custo unitário.

### Perfumaria

Perfumaria usa regra própria:
- comissão do vendedor: **3,5%**;
- objetivo de resultado líquido por item: **R$ 47** após custos considerados;
- preço deve ser arredondado para terminar em **,90**;
- painel Admin de precificação precisa distinguir categorias/regras.

---

## 8. Parcelamento e adquirentes

A página exibe:
- Pix;
- parcela destacada;
- “até 18x”;
- “Ver todas as parcelas”.

A hierarquia visual deve priorizar **quantidade de parcelas + valor da parcela**.
O total no cartão continua visível, mas subordinado.

O grid de parcelamento:
- 2 colunas;
- compacto;
- clicável;
- ao tocar numa parcela, o resumo principal atualiza;
- após seleção, o menu recolhe automaticamente após uma fração curta de tempo;
- **12x é a opção comercialmente destacada/preferencial**.

No formulário de pedido há seletor visual próprio de parcelamento, sem select nativo.

Adquirentes:
- Mercado Pago
- PagBank

A troca de adquirente recalcula parcelamentos sem alterar o Pix.

---

## 9. Página do produto — estado atual

Elementos principais:
- imagem do produto;
- badges;
- título;
- configuração;
- bateria quando aplicável;
- Pix;
- parcelamentos;
- trade-in para iPhones;
- CTA “Enviar pedido pelo WhatsApp”;
- CTA “Falar com um vendedor”;
- aviso de pagamento na entrega;
- logística/rota;
- destaques;
- descrição/ficha técnica.

### Card de configuração
Foi ajustado para não estourar texto; “Configuração” é visualmente subordinado.

### Trade-in
Texto:
**“Recebemos seu iPhone como entrada”**

Deve aparecer **somente em iPhones**.

### Zoom de imagem
Somente a página do produto tem zoom/lightbox.

Regras:
- clicar na imagem amplia;
- não abrir nova aba;
- catálogo deve permanecer perceptível ao fundo;
- lightbox menor que a viewport, com bordas/cantos mostrando contexto;
- controles de +, − e fechar;
- sem texto “Toque para ampliar”;
- home/catalog grid **não** deve ativar zoom: clicar na imagem da home navega diretamente para o produto.

---

## 10. Pedido rápido e WhatsApp

O formulário “Finalize pelo WhatsApp” coleta:
- forma de pagamento;
- parcelas quando cartão;
- nome;
- endereço;
- referência;
- observações.

O pedido enviado ao vendedor usa emojis para leitura rápida e traz:
- produto;
- configuração;
- cor;
- bateria quando aplicável;
- condição quando aplicável;
- entrega;
- pagamento;
- valor/parcela;
- total;
- cliente;
- endereço;
- referência;
- observação;
- link do aparelho;
- origem Plataforma Super Cell.

A antiga “Referência comercial: slug” foi removida do corpo do pedido porque era redundante.

A **cor é obrigatória visualmente na mensagem**. Se estiver ausente no cadastro, a mensagem deve denunciar isso como “Cor: Não informada” em vez de simplesmente omitir.

---

## 11. Link compartilhável do pedido

O formulário possui URL própria no mesmo produto, sem criar página paralela.

Padrão:
`/produto/<slug>?variante=<variant_id>&pedido=1`

Comportamento:
- abre a página do produto;
- preserva a variante;
- abre automaticamente o formulário de pedido;
- fechar o formulário remove `pedido=1` e mantém a variante;
- se a variante não existir/ficar indisponível, não deve abrir como se estivesse válida;
- deve orientar o cliente a escolher outra variante ou falar com vendedor.

No topo do formulário existem:
- **Copiar link**: copia somente o link puro;
- **Compartilhar**: usa o compartilhamento nativo do celular.

### Texto social atual de compartilhamento

Estrutura aprovada:

```
📱✨ *Finalize seu pedido na Super Cell pelo WhatsApp*

*MODELO · CONFIGURAÇÃO · COR*

É simples e rápido 😊
Abra o link abaixo, preencha seus dados e toque em *Enviar pedido pelo WhatsApp*.

*Clique aqui para finalizar seu pedido:* 👇👇👇

LINK
```

Detalhe importante: os três dedos ficam **na mesma linha da frase** e o link deve ficar separado por **duas quebras de linha reais**.

O commit mais recente `58126a8aeae56c0031ef6cdfd42532bf87319df8` existe especificamente para preservar essa quebra dupla no WhatsApp, incluindo o link diretamente no texto compartilhado.

---

## 12. Preview social do WhatsApp

O compartilhamento de páginas/produtos gera prévia com:
- imagem;
- nome;
- configuração;
- cor;
- Pix;
- até 18x;
- pagamento na entrega.

A foto deve corresponder à variante/produto correto.

Evitar imagens gigantescas quando possível, mas respeitar limitações do preview gerado pelo WhatsApp/Open Graph.

---

## 13. Admin — cadastro e edição

### Novo produto

O fluxo antigo de 4 passos foi substituído por cadastro guiado mais alinhado à operação.

Estrutura atual:
1. **Tipo**
2. **Produto**
3. **Variante**
4. **Comercial**
5. **Foto e revisão**

A primeira decisão é comercial:
- iPhone
- Android
- Outros produtos

Regras:
- iPhone implica Apple;
- Android pede marca depois;
- Outros pede categoria + marca;
- evitar selects nativos quando houver componente visual próprio.

### Seminovos
O cadastro precisa permitir:
- bateria;
- classificação/grade;
- componentes originais;
- nunca aberto;
- garantia;
- observações de condição;
- SIM;
- cor;
- imagem;
- custo/oferta;
- disponibilidade.

### Nova variante
A página de produto tem botão **Nova variante**.

A nova variante herda o contexto do produto/modelo e pede somente o que muda.

### Duplicar variante
Existe fluxo de **Duplicar variante** para casos como:
- mesmo modelo;
- mesma cor/configuração;
- bateria diferente;
- custo/SKU/foto diferentes.

---

## 14. Admin — central de variantes

A edição de produto foi transformada em central de gestão, evitando formulário gigante.

Topo:
- título do modelo;
- linha resumida com marca/categoria/condição/conectividade/publicação;
- botão Nova variante.

Dashboard:
- total de variantes;
- disponíveis;
- realmente na vitrine;
- reposição;
- cores;
- situação comercial agregada.

Filtros locais:
- Todas
- Disponíveis
- Reposição

Esses filtros devem funcionar **sem navegar para o topo da página**.

Lista de variantes:
- disponíveis primeiro;
- disponibilidade sempre visível;
- variantes em reposição/ocultas mostram só o essencial;
- detalhes aparecem quando necessário.

Grupos recolhíveis:
- imagem;
- condição;
- preço e margem;
- ofertas internas.

Só uma área deve dominar a atenção por vez no mobile.

### Link “Ver na vitrine”
É por variante, não global de produto.

Se disponível + modelo aprovado:
- “Ver na vitrine”

Se disponível + modelo em rascunho:
- “Aguardando revisão”

Se indisponível:
- “Fora da vitrine”

### Cor
A edição da cor foi aproximada do cabeçalho da variante, evitando procurar o campo muito abaixo.

---

## 15. Admin — tela geral de produtos

Além da busca textual, existem filtros:
- Todos
- iPhones
- Androids
- Outros

A busca continua funcionando dentro do grupo selecionado.

---

## 16. Feedback de interação no Admin

Problema antigo: botões pareciam “mortos”.

Diretriz:
- botões principais precisam dar feedback de toque/carregamento;
- salvar deve indicar progresso;
- mensagens de sucesso/erro precisam ser humanas;
- não expor mensagens técnicas como “Invalid input: expected string, received null” para o gestor;
- campos opcionais devem aceitar vazio corretamente.

---

## 17. Home — estado visual importante

A Home é considerada região crítica de conversão.

Diretrizes consolidadas:
- preservar o degradê contínuo entre CTA e benefícios;
- não criar linha/faixa perceptível entre os cards;
- os quatro cards de benefícios precisam manter o mesmo acabamento/bordas;
- não empurrar cards excessivamente para cima;
- preservar destaque e respiro do botão “Escolher meu celular”;
- remover texto desnecessário “Compra assistida e disponibilidade confirmada”;
- não alterar a Home aprovada sem necessidade.

Cards principais:
- Pagamento somente na entrega
- Entrega grátis no mesmo dia
- Mais de 50 cidades do RN
- Pix ou até 18x

---

## 18. Perfumaria / Super Cheiros

Nova categoria adicionada à Super Cell como braço comercial complementar.

Catálogo inicial:
`https://meucomercio.com.br/PERFUME2026`

Objetivo:
- reaproveitar produtos também relacionados à operação Super Cheiros;
- manter mesma estrutura de produto/variante/oferta;
- usar regra específica de precificação da perfumaria;
- avaliar posteriormente se algum grupo exige faixa própria.

---

## 19. Regras de UX prioritárias

- mobile first (360–430 px como referência);
- evitar scroll horizontal em áreas essenciais;
- não usar controles nativos quando prejudicam consistência visual;
- reduzir cliques;
- informação só aparece quando necessária;
- evitar formulários gigantes abertos;
- usar accordions/estado recolhido para edição;
- experiência deve parecer premium e simples;
- cada microdetalhe visual da Home e da página de produto é tratado como potencial impacto de conversão.

---

## 20. Commits recentes críticos

Ordem aproximada dos principais marcos recentes:

- `4c4894c...` — feedback no Admin e correção de publicação.
- `0632d275...` — disponibilidade por variante/cor.
- `42d9df1e...` — UX de variantes + zoom de imagem.
- `b91b610c...` — refinamento da lightbox.
- `c609cf2e...` — novo cadastro de produto e gestão de variantes.
- `4b0b254b...` — zoom removido da home; clique volta a navegar.
- `50d4c3bc...` — publicação, filtros e pedido WhatsApp.
- `3cc37dad...` — Androids passam a abrir primeiro.
- `a62b8ae4...` — cor no pedido e remoção de referência redundante.
- `bf40c980...` — link compartilhável do pedido.
- `2b9901ae...` — texto social de compartilhamento.
- `2ee04364...` — posição dos emojis e espaçamento.
- `58126a8a...` — quebra dupla real antes do link compartilhado.

---

## 21. Estado atual de produção

Produção:
`https://catalogo.supercellrn.com`

Commit atual no momento deste arquivo:
`58126a8aeae56c0031ef6cdfd42532bf87319df8`

Vercel:
- deployment de produção do commit acima: READY.

Supabase:
- projeto `super-cell` saudável no momento deste handoff.

---

## 22. Próxima conversa — instrução de retomada

Ao iniciar um novo chat deste projeto:

1. Ler este arquivo antes de propor mudanças.
2. Considerar GitHub `main` como fonte de verdade do código.
3. Conferir o commit atual e produção antes de modificar.
4. Preservar regras comerciais e UX já consolidadas.
5. Usar Plugin First.
6. Evitar reconstruir soluções já implementadas.
7. Se houver divergência entre este documento e o código atual, verificar o código/produção antes de assumir que este documento está correto.

Frase recomendada para abrir um novo chat:

**“Continue o projeto Super Cell. Leia primeiro o arquivo SUPER-CELL-HANDOFF.md no repositório e confira o estado atual da main/produção antes de qualquer alteração.”**

---

## 23. Observações finais

Este arquivo substitui o handoff antigo de pré-lançamento, que estava desatualizado e ainda descrevia estado anterior à integração GitHub → Vercel e às grandes mudanças de variantes, Admin, pedido compartilhável, perfumaria e UX.

O projeto está agora em produção e evoluindo incrementalmente. Mudanças futuras devem atualizar este handoff sempre que alterarem de forma relevante:
- arquitetura;
- regras comerciais;
- fluxo de cadastro;
- publicação;
- precificação;
- UX principal;
- integração com fornecedores;
- pedido/WhatsApp;
- infraestrutura.
