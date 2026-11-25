# Auditoria — retirada de ofertas Guanacel sem estoque (25/11/2026)

**Projeto:** Supercell RN; produção Supabase `rgbrdtstbaulxhzievkh`. **Autorização:** gestor confirmou em 25/11/2026 que a ausência do aparelho no catálogo oficial da Guanacel significa estoque zerado, devendo ser retirado da vitrine. **Regra canônica:** `docs/guanacel-dual-catalog-sync.md`.

## Comprovação da fonte

- RDI iPhones: listagem oficial https://guanacell2025.rdi.store/products com **12 UUIDs** de anúncios capturados em duas requisições independentes. Ofertas ativas F1 RDI fora da listagem identificadas por UUID, sem mesclar unidades.
- NEX Android/eletrônicos: https://meucomercio.com.br/GUANACELL08 com **21 códigos NEX** capturados e repetidos em outra requisição. 4 ofertas F1 ativas faltavam na listagem.
- NEX perfumes: https://meucomercio.com.br/PERFUME2026 com **77 códigos NEX** capturados; todas as 77 ofertas F4 ativas presentes, nenhuma desativação.

As páginas retornaram HTTP 200; extração parcial ou falha de fonte não autoriza exclusão. Todos os 14 códigos abaixo estavam ativos no Supabase antes da transação e não apareciam na listagem da fonte respectiva.

## Ofertas F1 desativadas — 10 RDI (iPhones)

| Modelo e variante | UUID RDI | Pix anterior | Resultado |
| --- | --- | ---: | --- |
| iPhone 12 128 GB 90% | `1bdc571b-dbac-4db5-b303-8f13ba8d072e` | R$ 1.727 | Oferta indisponível, reposição |
| iPhone 12 128 GB 93% | `0ee2d22c-d555-4821-9bfa-db9886c5cb00` | R$ 1.727 | Oferta indisponível, reposição |
| iPhone 12 128 GB 96% | `c9b111c5-56f9-44da-a7ff-d98f6ddee8c2` | R$ 1.727 | Oferta indisponível, reposição |
| iPhone 12 Pro Max 128 GB 93% | `c1474b23-7309-4f6d-8489-830cea2490fa` | R$ 2.377 | Oferta indisponível, reposição |
| iPhone 13 128 GB 95% | `69c250e1-3030-49a5-ab16-2c8ee6b7ef1f` | R$ 1.997 | Oferta indisponível, reposição |
| iPhone 14 Pro Max 256 GB 85% | `18d5a4c0-ef4d-4ad2-bd95-004bdfb30c08` | R$ 3.697 | Oferta indisponível, reposição |
| iPhone 14 Pro Max 256 GB 91% | `f5a1a903-ec16-4f3d-9e34-f1f14ebbc8f1` | R$ 3.667 | Oferta indisponível, reposição |
| iPhone 14 Pro Max 256 GB 98% | `19fe3fe4-636a-4b1c-8f8a-8b2e7b41ca49` | R$ 3.667 | Oferta indisponível, reposição |
| iPhone 15 Pro 128 GB 90% | `722d993a-ddb6-4c6e-92cc-9a05e7e85359` | R$ 3.497 | Oferta indisponível, reposição |
| iPhone 18 Pro Max 256 GB | `b285c89b-7596-47e6-b995-0e5bbce673f2` | R$ 9.497 | Oferta indisponível, reposição |

## Ofertas F1 desativadas — 4 códigos NEX (Android)

| Modelo | Código | Pix anterior | Resultado |
| --- | --- | ---: | --- |
| Multilaser UP Play 3G | `000015` | R$ 197 | Modelo em reposição |
| POCO F7 | `1000055` | R$ 2.847 | Modelo em reposição |
| POCO F8 Pro 5G NFC — variante ausente | `1000056` | R$ 3.597 | **Somente variante** em reposição; outras disponíveis |
| POCO M7 Pro 5G — variante ausente | `1000073` | R$ 1.177 | **Somente variante** em reposição; outra disponível |

## Resultado e verificação

Foram atualizadas 14 linhas de `supplier_offers` F1 para `available=false` com campos de auditoria no `raw_data` (`removal_reason`, `last_catalog_absence_date=2026-11-25`, `out_of_stock_confirmed_at`, `source_catalog`). Triggers existentes atualizaram automaticamente `product_variants.commercial_status` para `restocking` nas 14 variantes e `products.commercial_status` em 12 produtos sem alternativa. Não houve `DELETE`, mudança de preço, custo, imagem, código ou infraestrutura.

**Readback no Supabase:** as 14 ofertas estão indisponíveis, todas as 14 variantes `restocking`, as 12 unidades/modelos sem alternativa `restocking`; `public_catalog` não retorna oferta vendável para essas 14 (0 combinações com `public_available=true`). Os dois modelos com outras variantes ainda têm `products.commercial_status=available`.

**Readback web:** homepage em https://catalogo.supercellrn.com/?verify=guanacel-20261125-1936 respondeu HTTP 200 sem cards para `POCO F7`, `Multilaser UP Play 3G` ou `iPhone 18 Pro Max`; modelos `POCO F8 Pro` e `POCO M7 Pro` permanecem visíveis por variantes ainda em estoque.

**Operação diária:** instruções da automação `Sincronizar catálogos Guanacel` às 08h `America/Fortaleza` atualizadas com a regra de retirada e protegidas contra extração incompleta. Sem mudança de calendário, aprovação individual ou custo adicional.

**Risco:** a quantidade no site pode oscilar; não é possível deduzir esgotamento somente de resposta vazia, filtro inadequado, cache ou captura parcial. A prova é a lista integral verificada com UUID/código exato. Se o fornecedor reinserir o mesmo código, recuperar a mesma oferta e atualizar custo/disponibilidade com readback.

Nenhuma operação nos fornecedores F2/F3/F5, nas 77 ofertas F4 ativas ou nos preços manuais.
