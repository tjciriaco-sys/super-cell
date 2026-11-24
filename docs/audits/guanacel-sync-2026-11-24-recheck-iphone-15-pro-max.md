# Guanacel — revisão de preços após nova alteração — 24/11/2026

**Projeto:** Supercell RN · **Fonte de verdade:** `tjciriaco-sys/super-cell/main` · **HEAD antes do registro:** `1b06f37b9df3d926a7aa7c661ae7c2e3fd55cedf` · **Ambiente consultado e alterado:** Supabase `rgbrdtstbaulxhzievkh` de produção.

## Resultado da alteração autorizada

O anúncio RDI `9f1f35d8-18d1-48f6-a2bb-4493fbde0c9b` (iPhone 15 Pro Max, 256 GB, Titânio Azul, saúde da bateria 86%) passou a **R$ 4.250,00** de custo no catálogo do fornecedor, confirmado na listagem e página individual oficiais. O banco anterior marcava oferta disponível, custo **R$ 4.100,00**, Pix **R$ 4.297,00** e preço manual nulo.

Operação realizada em transação guardada, limitada à única oferta F1/RDI correspondente, sem mudar modelo, UUID, foto, variante, disponibilidade ou configuração de margem:

| Campo | Antes | Depois |
|---|---:|---:|
| Custo Guanacel | R$ 4.100,00 | **R$ 4.250,00** |
| Pix automático Supercell | R$ 4.297,00 | **R$ 4.447,00** |
| Disponibilidade | Sim | Sim |
| Saúde da bateria | 86% | 86% |

**Readback no banco:** `supplier_offers.cost=4250`, `supplier_offers.available=true`, `public_catalog.price_pix=4447`, `public_catalog.available=true`, `products.catalog_status=ready`, `product_variants.manual_price=null`. A página pública respondeu **HTTP 200** e exibiu **R$ 4.447,00 no Pix**, 86%, Titânio Azul, 256 GB e imagem no bucket próprio:

https://catalogo.supercellrn.com/produto/iphone-15-pro-max-seminovo-256-f1-rdi-20261111-77e5f72e

Origem verificada: https://guanacell2025.rdi.store/products/9f1f35d8-18d1-48f6-a2bb-4493fbde0c9b

## Conferência transversal da mesma execução

Após a gravação, os três catálogos oficiais foram extraídos novamente e conciliados por códigos, com os valores atuais do Supabase:

| Fonte oficial | Ofertas capturadas | Custo divergente após correção | Novos códigos não cadastrados |
|---|---:|---:|---:|
| Androids e eletrônicos — https://meucomercio.com.br/GUANACELL08 | 21 | 0 | 0 |
| iPhones — https://guanacell2025.rdi.store/products | 12 | 0 | 0 |
| Perfumes — https://meucomercio.com.br/PERFUME2026 | 77 | 0 | 0 |

- **Somente um custo alterado nesta rechecagem:** iPhone 15 Pro Max, +R$ 150 de custo e +R$ 150 no Pix.
- **Novos cadastros/publicações:** 0; **novas imagens temporárias:** 0; **itens retirados:** 0; **itens em revisão devido a preço/identidade divergente entre os capturados:** 0.
- **Ausências parciais protegidas:** 10 ofertas RDI antes disponíveis e 4 ofertas NEX Android antes disponíveis não apareceram na captura corrente; nenhuma foi desativada porque ausência na captura não comprova retirada efetiva.
- **Fotos externas legadas:** a internalização das fotos de perfumes já pendente não foi alterada por este trabalho; a imagem do iPhone 15 Pro Max permanece no Storage próprio.
- **Integridade:** nenhum preço manual, regra de margem, variante, categoria de outro fornecedor, código de UI ou infraestrutura foi modificado.

A conciliação acima atesta as **110 ofertas capturadas**; ela não equivale a confirmação de indisponibilidade das ofertas fora da captura. Atualizações comerciais na fonte são voláteis, com este relatório refletindo a leitura de 24/11/2026.
