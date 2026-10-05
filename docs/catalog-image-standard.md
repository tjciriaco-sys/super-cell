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
