# Guanacel — atualização de 11/11/2026

## Escopo e autorização
Tiago pediu concluir e publicar a atualização de todos os celulares, autorizando explicitamente usar as mesmas fotos dos dois catálogos do fornecedor. Mantido o layout; preço manual, faixas, parcelamento, logística e categorias secundárias preservados.

Fontes lidas ao vivo:
- https://meucomercio.com.br/GUANACELL08 — 29 referências, 21 de celulares.
- https://guanacell2025.rdi.store/products — 16 anúncios; páginas individuais conferidas no navegador.
- IDs próprios da RDI usados na oferta; UUID da foto serve como referência de mídia, não como prova de unidade antiga.
- Duas referências X8 512 preto (1000108/1000109) representam a mesma configuração/preço/foto e apontam à mesma variante.

## Imagens
36 arquivos do fornecedor baixados, normalizados para WebP 900×900 (9.430–45.956 bytes), enviados e confirmados em storage.objects e internal.has_stored_catalog_webp. O manifesto contém hashes e tamanhos. Sem hotlink na vitrine. Para M7 Pro verde, o fornecedor entrega placeholder; preservada a foto própria válida já existente.
A autorização atual permite a foto ilustrativa do fornecedor; não implica inventar cor quando o título não informa. Cores ausentes permanecem nulas. Originais, nunca aberto, garantia e grau de conservação não foram presumidos.

A função já existente super-cell-product-image-ingest foi usada com JWT obrigatório, autenticação adicional, manifesto fechado por SHA-256/tamanho/caminho e validade curta. Readback v5: encerrada, responde 410; JWT permaneceu habilitado. Nenhum segredo versionado.

## Dados preparados
17 produtos em draft, 19 variantes, 20 ofertas: 2 novos modelos Android com 4 configurações e 5 códigos; 15 anúncios iPhone individualizados. Fotos de 15 variantes Android existentes atualizadas; a 16ª manteve imagem própria porque a fonte é placeholder.
Preparação transacional confirmada; publicação em publish.sql. A publicação desativa as três correspondências antigas provisórias de iPhone e libera as unidades RDI identificadas. Preserva históricos.
Rollback em rollback.sql torna os novos modelos draft e restaura imagens e ofertas antigas que estavam ativas antes desta execução.

## Correções necessárias à entrega
- Remove filtros e fotos temporárias do Preview que escondiam iPhones novos e divergiam do Supabase.
- RAM comercial com verificação física e limite de armazenamento: X8 256 = 12 GB; X8 512 = 24 GB anunciados, 12 físicos + 12 virtuais. Cards, configuração, ficha, pedido, WhatsApp e metadados usam o mesmo total.
- Grau desconhecido de seminovo deixa de receber automaticamente a alegação Excelente. Nenhuma reclassificação arbitrária dos dados.

## Fontes técnicas
POCO F7: https://www.mi.com/uk/product/poco-f7/specs/
POCO X8 Pro Max: https://www.po.co/global/product/poco-x8-pro-max/specs/
Expansão 12+12 verificada: https://www.mi.com/my/support/faq/details/KA-676346/
iPhones Apple: https://support.apple.com/pt-br/111876 (12), /111875 (12 Pro), /111874 (12 Pro Max), /111871 (13 Pro), /111850 (14), /111846 (14 Pro Max), /111829 (15 Pro), /111828 (15 Pro Max), /121032 (16 Pro Max).
iPhone 18: https://www.apple.com/br/iphone-18-pro/specs/
RAM por desmontagem: páginas Device da iFixit para iPhone_12, iPhone_12_Pro, iPhone_12_Pro_Max, iPhone_13_Pro, iPhone_14, iPhone_14_Pro_Max, iPhone_15_Pro, iPhone_15_Pro_Max, iPhone_16_Pro_Max e iPhone_18_Pro_Max.
Não publicar garantia de vedação em seminovo: especificação identifica certificação original e possível redução com uso.

## Pendência objetiva do fornecedor
Um anúncio “iPhone 12 Pro Pro Max (128 GB) 🔋93%”, R$2.200 de custo, tem título ambíguo, descrição de 12 Pro e foto ilustrativa sem identificação inequívoca. Conservado em pending.json/import_batches, sem inventar modelo ou publicar ficha incorreta. Foto já hospedada; não depende de upload.
NFC regional de produtos legados já pendentes (C81 Pro/A7 Pro/Go2) não foi inventado nesta sincronização.

## Verificação
31 testes passaram; TypeScript, lint dos arquivos afetados, git diff --check e build Next.js concluídos.
Estado desta revisão: dados novos preparados em draft; confirmar publicação e inspeção mobile no adendo final antes de declarar entrega.
