# Padrão permanente de imagens do catálogo

Este padrão é obrigatório para todo produto novo ou atualizado por catálogo de fornecedor.

## Fonte e propriedade do arquivo

- Priorizar material oficial do fabricante.
- Marketplace pode ser usado como referência quando não houver material oficial adequado.
- Nunca publicar hotlink: a imagem final deve ser tratada e armazenada pela Super Cell.
- Não usar imagem com marca d'água, preço, selo promocional, identificação de loja ou cenário de marketplace.

## Tratamento técnico

- Gerar WebP quadrado de 900 × 900 px.
- Fundo branco ou transparente, produto centralizado e sem margens internas excessivas.
- O produto deve ocupar aproximadamente 78% a 88% da área útil.
- Remover metadados e manter preferencialmente até 150 KB.
- Usar `scripts/normalize-product-image.sh origem destino.webp` como base; fazer ajuste visual quando o recorte automático não preencher bem a área.

## Regra de cor

- Estratégia `variant` (padrão): cada cor anunciada precisa de imagem própria e vinculada à variante correta.
- Estratégia `group` (exceção consciente): uma única foto pode ser compartilhada somente quando ela mostra, na própria imagem, todas as cores oferecidas.
- Nunca vincular uma foto de uma única cor a variantes de outras cores.
- Cor, capacidade, RAM, preço e disponibilidade devem formar uma combinação real do fornecedor; não criar combinações implícitas.

## Publicação e QA

Antes de publicar, confirmar:

1. arquivo local existente e carregando;
2. formato WebP, dimensões e peso;
3. ausência de marca d'água ou identificação de terceiros;
4. correspondência entre cor selecionada e imagem;
5. troca de cor atualizando imagem, preço, capacidade e fornecedor quando aplicável;
6. visualização no card e na página do produto em 360, 390 e 430 px.

O painel administrativo audita automaticamente produtos ativos sem imagem própria por cor, imagens repetidas entre cores e fotos coletivas sem arquivo geral.

## Importação automática obrigatória — inclusive listas WhatsApp

**NUNCA gravar a URL externa da pesquisa como imagem final**, ainda que abra no navegador, apareça em um resultado de busca ou pareça estável. A regra vale para fornecedores sem catálogo online (por exemplo, F5 Pedro Neto) e para lotes de 3, 10 ou 50 produtos. A IA/agente deve cumprir esta sequência sem transferir upload de fotos ao gestor:

1. Identificar imagem oficial da variante correta (marca, modelo, cor, geração, rede), usar pesquisa via Firecrawl/web e confirmar a fonte; não confundir `moto g06` com `moto g06 power` nem Galaxy A17 4G com 5G.
2. Obter os bytes por uma fonte acessível ao ambiente operacional. Se uma origem bloquear download, buscar a foto em fonte alternativa e repetir o teste; NÃO registrar hotlink quebrado no banco.
3. Normalizar automaticamente em WebP quadrado 900 × 900, fundo branco/transparente, produto centralizado, aproximadamente 78%–88% da área útil; preferir até 150 KB, evitando imagem em branco, de erro, borrada ou com marca d'água. O script `scripts/normalize-product-image.sh` define a referência de tratamento; processamento por serviço/Edge deve respeitar o mesmo resultado.
4. Fazer upload pelo fluxo autenticado ao Supabase Storage público `product-images/products/<slug>/<variante>.webp` usando plugin/ação de ingestão, atualizar `product_variants.images` e, se aplicável, a imagem principal do produto. Verificar a resposta HTTP, Content-Type `image/webp`, tamanho/dimensões e correspondência visual da cor.
5. Somente depois marcar o produto como pronto. A migração `20261019124000_require_verified_webp_for_new_products.sql` bloqueia no banco novos produtos/variantes publicados a partir de 19/10/2026 às 08:00 BRT se o arquivo WebP não existir no bucket com metadados válidos. Uma URL plausível sozinha NÃO basta.
6. Validar pelo `public_catalog` e visualmente na vitrine mobile. Relatar claramente quais foram carregadas e quais não foram verificadas visualmente.

O processamento de imagem é responsabilidade da rotina/agente, jamais uma tarefa manual repassada ao proprietário. Se faltar capacidade de upload por plugin, executar pelo mecanismo autenticado existente do projeto ou corrigir a automação, não substituir a etapa por link externo. Não adicionar foto sintética de outra configuração para completar cadastro.
