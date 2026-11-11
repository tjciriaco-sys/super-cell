# Guanacel — atualização de 11/11/2026

## Escopo e autorização
Tiago pediu concluir e publicar a atualização de todos os celulares, autorizando explicitamente usar as mesmas fotos dos dois catálogos do fornecedor. Mantido o layout; preço manual, faixas, parcelamento, logística e categorias secundárias preservados.

Fontes lidas ao vivo:
- https://meucomercio.com.br/GUANACELL08 — 29 referências, 21 de celulares.
- https://guanacell2025.rdi.store/products — 16 anúncios; páginas individuais conferidas no navegador.
- IDs próprios da RDI usados na oferta; UUID da foto serve como referência de mídia, não como prova de unidade antiga.
- Duas referências X8 512 preto (1000108/1000109) representam a mesma configuração/preço/foto e apontam à mesma variante.

## Imagens
36 arquivos do fornecedor baixados, normalizados para WebP 900×900 (9.430–45.956 bytes), enviados e confirmados em storage.objects e internal.has_stored_catalog_webp. O manifesto contém hashes e tamanhos. Sem hotlink na vitrine. Para M7 Pro verde, o fornecedor entrega placeholder e a foto anterior era JPEG externo do aparelho preto. Substituída por recorte da imagem oficial verde da Xiaomi (fonte abaixo), também WebP 900×900: total de 37 arquivos hospedados.
A autorização atual permite a foto ilustrativa do fornecedor; não implica inventar cor quando o título não informa. Cores ausentes permanecem nulas. Originais, nunca aberto, garantia e grau de conservação não foram presumidos.

A função já existente super-cell-product-image-ingest foi usada com JWT obrigatório, autenticação adicional, manifesto fechado por SHA-256/tamanho/caminho e validade curta. Readback v8: encerrada, responde 410; JWT permaneceu habilitado. Nenhum segredo versionado.

## Dados preparados
17 produtos publicados, 19 variantes, 20 ofertas: 2 novos modelos Android com 4 configurações e 5 códigos; 15 anúncios iPhone individualizados. Fotos das 16 variantes Android existentes atualizadas, incluindo a correção da imagem verde após a inspeção final.
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
Publicação aplicada e confirmada: 20 opções Android (12 modelos) e 15 iPhones individualizados, 35 variantes disponíveis exclusivamente de F1. Três ofertas provisórias antigas de iPhone desativadas, históricos preservados. Todas as 35 páginas e respectivas imagens responderam HTTP 200. Todas as imagens finais são WebP 900×900 hospedadas no projeto.

Inspeção mobile em 360, 390 e 430 px. Corrigida quebra da configuração no iPhone para separar RAM/armazenamento do indicador de bateria. Removida também a alegação automática #Excelente nos cards quando o grau é desconhecido. PRs #39 e #40 publicados; complemento final contém o ajuste dos cards e estas evidências. Catálogo público: https://catalogo.supercellrn.com/ .

M7 Pro verde: https://www.mi.com/uk/product/poco-m7-pro-5g/specs/ ; imagem https://i02.appmifile.com/357_operator_sg/09/06/2025/9d909531e8822cf3040d766a8c5803cc.png . Recorte (790,0,1010,640) da composição original, sem alteração de cor.

A pendência do anúncio 12 Pro/Pro Max é de identificação do fornecedor, não de upload ou implementação. O lote permanece review por essa única referência.
