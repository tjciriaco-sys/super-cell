# Super Cell — handoff pré-lançamento

## Estado de origem

- Base Git preservada: `cd859d5e6251fa0b7117f285232391785a51ecf5`.
- Este pacote preserva a página de produto consolidada, o card comercial de entrada de iPhone e o gerenciamento administrativo de imagens.
- Supabase, banco de dados, GitHub e Vercel não foram alterados nesta preparação.

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4
- Supabase (`@supabase/ssr` e `@supabase/supabase-js`)
- Vitest e ESLint

## Estrutura principal

- `src/app/`: rotas públicas, página de produto e painel administrativo.
- `src/components/`: componentes da vitrine, produto, pedido e administração.
- `src/lib/`: catálogo, regras comerciais, precificação, logística e integrações.
- `public/`: assets estáticos servidos diretamente pela aplicação.
- `public/products/guanacel-20261003/`: nove capas WebP 800×800 usadas pelas 14 unidades publicáveis da lista Guanacel.
- `supabase/migrations/`: histórico de migrations SQL versionadas.
- `docs/`: documentação existente do projeto; alguns textos antigos estão marcados abaixo para revisão.
- `src/**/*.test.ts`: testes automatizados.

## Instalação e execução

Requisitos: Node.js compatível com Next.js 16 e npm.

```bash
npm ci
npm run dev
```

Build e execução de produção:

```bash
npm run build
npm run start
```

Validações:

```bash
npx eslint src
npm test
```

## Variáveis de ambiente necessárias

Configure os valores de forma segura no ambiente de destino. O pacote não contém arquivos `.env` nem valores secretos.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Relação com Supabase

A aplicação lê o catálogo público, configurações comerciais, logística e dados administrativos do Supabase. As migrations existentes ficam em `supabase/migrations/`, mas este pacote não aplica migrations nem modifica banco. Antes de publicar em outro ambiente, vincule a aplicação ao projeto Supabase correto e confirme que as migrations e os dados comerciais esperados já estão presentes.

## Regra de imagens comerciais

- `storefront_image` deve apontar para um caminho público existente, por exemplo `/products/guanacel-20261003/iphone-12-preto-1-cor.webp`.
- Os arquivos referenciados localmente devem existir dentro de `public/`, para viajarem junto com o código e serem servidos no mesmo domínio.
- Para o lote Guanacel de 03/10/2026, `image_strategy` permanece `variant`.
- A mesma capa comercial é exibida na vitrine e no topo da página de produto.
- A imagem principal não muda quando o cliente escolhe uma cor; a cor é definida no formulário do pedido.
- As capas Guanacel presentes neste pacote são WebP 800×800.

## Implementado no código

- Catálogo público com categorias, busca e ordenação.
- Android como categoria inicial e ordenação inicial por maior preço.
- Estados comerciais `available`, `coming_soon` e `restocking`.
- Página de produto com capa comercial permanente, cores disponíveis em caráter informativo, memória/configuração, preço Pix, parcelamento, logística e CTAs.
- Escolha de cor no formulário: automática para uma única cor e explícita/obrigatória para múltiplas cores.
- Pedido por WhatsApp com identificação da variante e da cor escolhida.
- Registro de interesse para produtos sem oferta imediata.
- Regra automática de preço implementada em `src/lib/pricing.ts`.
- Integração de adquirentes e parcelamento baseada nas configurações lidas pela aplicação.
- Painel administrativo e suas rotas existentes.
- Card “Recebemos seu iPhone como entrada” na página do produto, com CTA de avaliação pelo WhatsApp.
- Lote Guanacel de 03/10/2026 preparado com identidades comerciais individuais; 14 unidades possuem capas confirmadas e compartilham nove assets quando a representação visual é idêntica.
- Página de produto consolidada com badges Apple/Seminovo/5G, título somente com modelo, cards de configuração e bateria lado a lado e card de entrada em largura ampla.
- Painel administrativo com `/admin`, `/admin/login` e `/admin/ativar`, protegido por Supabase Auth e `admin_profiles.active`.
- Upload administrativo mobile em `src/components/admin-product-image-upload.tsx`, com preview local e server action `saveVariantImage`.
- Upload aceita JPEG, PNG e WebP até 5 MB e grava as referências em `product_variants.images`.
- A opção de compartilhamento aplica a mesma imagem às variantes equivalentes por marca, categoria, modelo, condição, conectividade e cor, sem separar por bateria ou armazenamento.
- `products.storefront_image` e `products.image_strategy` permanecem preservados; a imagem da variante não sobrescreve indiscriminadamente a capa do produto.
- Bucket público de leitura `product-images`, com escrita/atualização/exclusão restritas a administradores ativos por policies de Storage.
- Migration de Storage: `supabase/migrations/20261005150000_product_images_storage.sql`.
- Link discreto `Acesso do gestor` no rodapé público, apontando para `/admin/login`.

## Regras críticas efetivamente representadas

- Não há controle de quantidade ou estoque físico próprio da Super Cell.
- Ofertas comerciais são vinculadas a fornecedores; disponibilidade pública depende das fontes válidas.
- Unidades seminovas com bateria ou custo diferentes permanecem individualizadas.
- Saúde da bateria é informação individual, pode ser inferior a 85% ou ausente e não determina automaticamente a classificação do aparelho.
- Preço, custo, bateria, SKU e código externo não devem ser fundidos entre unidades comerciais distintas.
- A capa comercial deve existir como arquivo real no caminho indicado por `storefront_image`.

## Situação desta entrega

- Build de produção aprovado.
- 26 testes automatizados aprovados.
- `src/` aprovado no ESLint.
- Nove WebPs Guanacel validados e servidos localmente com HTTP 200.
- Página de produto validada localmente com HTTP 200, CTA de pedido e card de entrada presentes.
- O comando global `npm run lint` também inspeciona `tmp/`; um arquivo temporário pré-existente nessa pasta falhava no lint. A pasta `tmp/` não faz parte deste pacote.

## Pendente / não confirmado no código ou fora deste pacote

- Publicação em Vercel e sincronização com GitHub não foram executadas.
- Valores das variáveis de ambiente precisam ser configurados no destino.
- O banco Supabase de destino precisa conter o catálogo e as configurações comerciais atuais; nenhum dado de banco está embutido neste ZIP.
- Em produção, as unidades Guanacel devem existir no catálogo do Supabase. A lista de preview definida em código é usada apenas fora de `VERCEL_ENV=production`.
- Duas unidades da lista Guanacel permanecem pendentes por cor/capa não confirmada: iPhone 14 Pro Max 128 GB (indicação original 🧡) e iPhone 15 Pro Max 512 GB (indicação original 💜).
- `docs/production-rules.md` e `docs/catalog-image-standard.md` contêm trechos anteriores às decisões comerciais mais recentes (incluindo bateria mínima e troca de imagem por cor) e devem ser revisados antes de serem tratados como fonte normativa atual.
- O primeiro acesso administrativo continua dependendo do fluxo existente em `/admin/ativar` e do código de ativação inicial, que não é armazenado neste pacote.
- A troca de imagens atuais deve ser feita posteriormente pelo proprietário no painel; nenhum asset existente foi corrigido ou substituído nesta etapa.
