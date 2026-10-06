# Regras permanentes de produção da Super Cell

Toda melhoria aprovada deve seguir esta ordem de preferência:

1. configuração no banco ou painel, quando a operação pode mudar;
2. regra reutilizável de domínio, quando vale para todos os produtos;
3. validação automática e alerta administrativo;
4. teste automatizado para cálculos e decisões críticas;
5. correção pontual somente quando o fato pertence exclusivamente àquele SKU.

## Entrada de produtos

- Todo produto novo nasce como `draft` e fica invisível na vitrine.
- A publicação exige promoção explícita para `ready` após QA.
- O banco impede a promoção sem variante ativa, oferta disponível, custo positivo e imagem válida.
- Produto inativo ou variante sem oferta disponível não aparece ao consumidor.
- Uma combinação de modelo, RAM, armazenamento, cor e condição corresponde a uma variante real; fornecedores concorrentes entram como ofertas da mesma variante.
- 4G e 5G são produtos separados quando alteram especificações relevantes.

## Imagens e cores

- Aplicar integralmente `docs/catalog-image-standard.md`.
- Cada variante/cor é exibida como item comercial independente na vitrine.
- A imagem principal do item é a imagem própria da variante; não gerar capa multicor por sobreposição.
- Toda cor nova pode receber `color_hex`, evitando representação visual genérica.
- A abertura do card deve manter a página do produto restrita à variante selecionada, preservando conjuntamente imagem, preço, capacidade, condição e fornecedor.

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
- Valores, parcelamento, entrega e mensagem do WhatsApp devem derivar da variante selecionada.
- Cores diferentes do mesmo modelo aparecem em cards separados, mesmo quando compartilham o mesmo produto-base no banco.

## Critério de conclusão

Uma melhoria não está concluída quando apenas corrige o exemplo que revelou o problema. Ela deve também proteger os próximos cadastros por configuração, validação, teste ou alerta.
