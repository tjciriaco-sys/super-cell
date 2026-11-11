# Complemento Guanacel — tablets, relógios e receptor — 11/11/2026

## Resultado e cobertura
Autorização explícita: concluir todos os produtos Guanacel, além dos celulares já entregues.
Fonte lida ao vivo: https://meucomercio.com.br/GUANACELL08 .
29 referências: 21 celulares (20 configurações) e 8 outras ofertas:
- Tablets: ;000007 (Pad 2 4/128 cinza), 000132 (Pad 2 4/256 cinza), 000167 (Pad 2 4/256 verde), 000059 (Pad 2 Pro 6/128 cinza).
- Smartwatches: 000076 (KW20, kit 5 pulseiras), 000077 (WS10-2, kit 7 pulseiras), 000079 (W10, 46 mm).
- Receptor: 000052 (Alphaplay Plus).
As páginas individuais foram conferidas. Os 8 custos continuam iguais à fonte atual; datas, origem, fotos e fichas foram atualizadas. Não houve novos produtos ou duplicação. Pad 7, código 000060, ausente na fonte, teve somente a oferta F1 desativada. Histórico preservado.
Outros fornecedores (incluindo F3, acessórios e perfumaria) não são Guanacel e permanecem fora deste lote. Os 35 celulares continuam disponíveis.

## Fotos
8 arquivos normalizados WebP 900×900, 16.832–54.212 bytes; upload confirmado com objeto, MIME e função internal.has_stored_catalog_webp.
O usuário autorizou expressamente fotos do catálogo, inclusive embalagens e kits: fotos de relógios/receptor mantêm a apresentação do fornecedor.
A fonte anunciava Pad 2 verde com foto roxa: substituída por imagem oficial coletiva com as três cores, incluindo verde e cinza. Exceção coletiva consciente: products.image_strategy=group, capa coletiva oficial; fotos cinza individuais preservadas nas variantes. Não foi alterada a cor da imagem.
A imagem do Pad 2 Pro na fonte apresentava geração anterior; substituída por recortes oficiais cinza (frente e verso) da composição da Xiaomi.
manifest.json registra origens, SHA-256 e tamanhos.
Ingestão existente: JWT continuou obrigatório, token adicional efêmero e manifesto fechado por hash/tamanho/caminho. Após os 8 uploads, função redeployada e readback v10 confirma encerramento HTTP 410. Nenhum segredo versionado.

## Fichas e dúvidas
Pad 2: Helio G100-Ultra, tela LCD 11 polegadas 2560×1600/90 Hz, 9.000 mAh/18 W, Wi-Fi 5, Bluetooth 5.3, câmeras 8/5 MP, HyperOS 2.
Pad 2 Pro: Snapdragon 7s Gen 4, tela LCD 12,1 polegadas 2560×1600/120 Hz, 12.000 mAh/33 W, Wi-Fi 6, Bluetooth 5.4, câmeras 8/8 MP, HyperOS 2.
Destaques e especificações estruturados em objetos; RAM/capacidade permanecem por variante.
RAM comercial agregada não foi identificada nestas ofertas.
**Auditoria legada:** fonte anuncia Pad 2 4/256 em cinza/verde; página global da Xiaomi lista 8/256. Mantidos os 4 GB já existentes e explicitamente anunciados pela Guanacel; não convertido para 8 GB nem aplicado RAM virtual sem prova. Pendência de SKU regional registrada em supplier_offers.raw_data. Solicitar confirmação da Guanacel antes de tratar a RAM física dessas duas ofertas como tecnicamente comprovada.
Relógios genéricos e receptor: ficha registra somente modelo, tamanho/kit comprovados no anúncio. Sem inventar GPS, IP68, funções médicas, autonomia, memória, canais ou garantia.
A referência iPhone 12 Pro/Pro Max ambígua permanece pendente conforme relatório principal.

## Verificação
8 páginas HTTP 200, 8 imagens HTTP 200/WebP/900×900; preços Pix conferidos em public_catalog: Pad 2 128 R$1.257, Pad 2 256 R$1.377, Pad 2 Pro R$1.697, KW20 R$197, WS10-2 e W10 R$187, receptor R$527.
Inspeção mobile real 360/390/430 px identificou white-space:nowrap nos títulos longos. Ajuste CSS permite quebra natural e evita expansão da coluna, preservando desenho aprovado.
Sem mudança de cálculo de preço, parcelamento, fornecedor fixado, dados pessoais, contratos ou schema. Build Next.js é o check relevante da alteração CSS.
update.sql e rollback.sql registram operações reversíveis; ler o estado atual antes de qualquer reaplicação.
Catálogo público: https://catalogo.supercellrn.com/

## Fontes técnicas
- https://www.mi.com/global/product/redmi-pad-2/specs/
- https://www.mi.com/global/product/redmi-pad-2/
- https://www.mi.com/global/support/faq/details/KA-572986/
- https://www.mi.com/global/product/redmi-pad-2-pro/specs/
