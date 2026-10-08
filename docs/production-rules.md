# Regras permanentes de produção da Super Cell

Toda melhoria aprovada deve seguir esta ordem de preferência:

1. configuração no banco ou painel, quando a operação pode mudar;
2. regra reutilizável de domínio, quando vale para todos os produtos;
3. validação automática e alerta administrativo;
4. teste automatizado para cálculos e decisões críticas;
5. correção pontual somente quando o fato pertence exclusivamente àquele SKU.

## Entrada de produtos

- Todo produto novo nasce como `draft` e fica invisível na vitrine.
- A publicação exige promoção explícita para `ready` após revisão. Na interface, usar a linguagem humana **“Revisado e aprovado — pode aparecer”** em vez de “QA aprovado”.
- O banco impede a promoção sem variante ativa, oferta disponível, custo positivo e imagem válida.
- Produto inativo ou variante sem oferta disponível não aparece ao consumidor.
- Uma combinação de modelo, RAM, armazenamento, cor e condição corresponde a uma variante real; fornecedores concorrentes entram como ofertas da mesma variante.
- 4G e 5G são produtos separados quando alteram especificações relevantes.

## Imagens e cores

- Aplicar integralmente `docs/catalog-image-standard.md`.
- A estratégia padrão é uma imagem por cor; foto coletiva precisa ser marcada conscientemente.
- Toda cor nova pode receber `color_hex`, evitando representação visual genérica.
- A troca de variante deve atualizar conjuntamente imagem, preço, capacidade, condição e fornecedor.

## Seminovos

- Seminovo é permitido comercialmente para iPhones; Android seminovo exige decisão comercial explícita.
- Novo iPhone seminovo herda: condição Excelente, bateria mínima de 85% e garantia de 3 meses.
- Exceções de condição, originalidade, abertura e bateria pertencem à variante e são editáveis no painel.
- Condições diferentes com preços diferentes são variantes distintas.

## Preço, fornecedor e disponibilidade

- O menor custo disponível é selecionado automaticamente, salvo fornecedor fixado manualmente.
- Preço manual nunca é sobrescrito por atualização de fornecedor.
- O painel e a vitrine usam as mesmas faixas configuradas no banco; não duplicar tabelas comerciais em componentes.
- O código interno F1/F2/F3 é derivado da oferta escolhida e nunca do nome do produto.
- Produtos sem oferta ativa ficam fora da vitrine.

## Interface comercial

- Categorias são compartilháveis por URL e novas categorias secundárias entram em “Outras”.
- “Novo · Lacrado” deriva da condição do produto; condição do seminovo deriva da variante.
- Armazenamento/RAM devem aparecer no card e na página sempre que conhecidos.
- O CTA principal deve informar que o pedido será enviado pelo WhatsApp.
- A home abre com **Androids** selecionado por padrão; a ordem principal é Androids → iPhones → Outros.
- Valores, parcelamento, entrega e mensagem do WhatsApp devem derivar da variante selecionada.
- A imagem dos cards da home não abre zoom; ela apenas navega para o produto. O zoom/lightbox existe somente na página de produto.
- O pedido rápido é compartilhável por URL com `?variante=<id>&pedido=1`, preservando a variante e abrindo o formulário diretamente.
- O botão **Copiar link** copia o endereço puro; **Compartilhar** envia a mensagem social pronta.
- No WhatsApp, a mensagem social do link deve manter duas quebras de linha entre `👇👇👇` e a URL.
- O pedido final ao vendedor deve conter cor explicitamente e não deve repetir slug/referência comercial redundante.

## Perfumaria

- Perfumaria usa regra própria de precificação.
- Comissão do vendedor: **3,5%**.
- Resultado líquido alvo por item: **R$ 47**.
- Preço Pix deve terminar em **R$ x,90**.
- O Admin de precificação deve selecionar/aplicar a regra por categoria.

## Admin e variantes

- Variante disponível não significa automaticamente publicada: a vitrine exige variante disponível + produto revisado/aprovado.
- Quando a variante está disponível e o produto ainda está em rascunho, mostrar **“Aguardando revisão”**.
- Os filtros Todas / Disponíveis / Reposição na página do produto devem ser locais e não podem recarregar nem jogar a página para o topo.
- A lista geral de produtos deve permitir filtrar Todos / iPhones / Androids / Outros em conjunto com a busca textual.
- Disponibilidade deve permanecer sempre visível; detalhes de imagem, condição, preço e ofertas ficam recolhíveis.
- O acesso “Ver na vitrine” pertence à variante.
- Deve existir fluxo de **Nova variante** e ação **Duplicar variante**.

## Critério de conclusão

Uma melhoria não está concluída quando apenas corrige o exemplo que revelou o problema. Ela deve também proteger os próximos cadastros por configuração, validação, teste ou alerta.
