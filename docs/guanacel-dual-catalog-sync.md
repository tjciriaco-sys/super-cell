# Guanacel — duas fontes canônicas de celulares Supercell RN

**Decisão comercial:** 11/11/2026. **Fornecedor exclusivo de celulares:** Guanacel (F1). Esta regra vigora para todas as próximas solicitações de atualização do catálogo, sem precisar recolher os links novamente.

## Fontes obrigatórias

- **Android:** https://meucomercio.com.br/GUANACELL08
- **iPhone:** https://guanacell2025.rdi.store/products

O conjunto de celulares comercialmente disponíveis na Supercell RN deve ser a **união das ofertas de celulares atualmente disponíveis nos dois catálogos**. O catálogo Android também contém itens de outras categorias: **não retirar tablets, relógios, receptores, perfumaria, acessórios etc.** por não serem celulares. F2, F3, F4 e F5 podem continuar cadastrados para essas outras categorias; não são mais fornecedores válidos para disponibilidade de celulares.

## Rotina a executar em cada atualização

1. Ler os **dois** catálogos ao vivo, validando carregamento completo, paginação/rolagem, URLs individuais, código do fornecedor (quando houver), preço de custo, cor, memória, condição, bateria, fotos e disponibilidade. Falha de extração não é prova de retirada de estoque.
2. Cruzar com `products`, `product_variants`, `supplier_offers` e `public_catalog` no Supabase do produto, preservando produtos, imagens, IDs, históricos, limites de precificação e preços manuais. A identidade comercial é modelo + 4G/5G + RAM **física** + capacidade + cor + condição; em seminovos, saúde da bateria e identidade da unidade também distinguem ofertas.
3. Atribuir novos custos a ofertas corretamente correspondentes; desabilitar ofertas de celulares inexistentes nas duas fontes, **sem excluir fisicamente** os registros. Atualização de ofertas deve preservar as categorias não relacionadas.
4. A loja de iPhones RDI pode apresentar anúncios individuais sem código externo, cor, garantia ou grau de conservação. A imagem identificada por UUID pode ser mantida **como referência interna de conciliação**, jamais como hotlink comercial. Não fundir unidades ou atribuir cor/condição/originalidade sem prova; divergências ficam em revisão.
5. Para novos modelos/variantes, confirmar ficha técnica oficial, rede, NFC regional e RAM física/virtual. Baixar e tratar automaticamente fotos oficiais e/ou adequadas de cada cor; produzir **WebP 900×900** e publicar no Supabase Storage `product-images`. Sem arquivo próprio validado, **não promover de `draft` a `ready`**. Não transferir ao gestor a obrigação de subir fotos individuais.
6. Validar os preços produzidos pelas faixas vigentes do banco (e preços manuais), cards, variante correta, WhatsApp e visual real de celular no Preview antes de declarar pronto ou publicar mudança estrutural. Registrar auditoria antes/depois e readback.

Continuam obrigatórios [product-catalog-publication-standard.md](product-catalog-publication-standard.md), [catalog-image-standard.md](catalog-image-standard.md) e [production-rules.md](production-rules.md).

## Auditoria de 11/11/2026 — estado parcial, não homologado

- **Android:** 21 ofertas de celulares encontradas em 29 ofertas totais do site (as 8 restantes não eram celulares). 16 ofertas F1 existentes tiveram custo/disponibilidade sincronizados. 12 ofertas antigas de celulares (inclusive de F5) foram marcadas indisponíveis. Foram identificados **5 novos códigos**, ainda sem publicação por foto/ficha.
- **iPhone:** 16 anúncios individualizados na RDI. 17 ofertas antigas F1 com combinação modelo/armazenamento/bateria inexistente no catálogo novo foram marcadas indisponíveis. Três ofertas antigas foram conservadoramente mantidas por **possível** coincidência de modelo, memória e saúde de bateria, sem comprovação de ser a mesma unidade/cor. Os novos anúncios aguardam conciliação, fotos próprias e ficha.
- **POCO X8 Pro Max:** a Guanacel anuncia duas referências comerciais `24/512` que não comprovam 24 GB de RAM física. Especificação oficial da POCO lista **12 GB físicos** em 512 GB; comprovar expansão virtual antes de mostrar 24 GB como total e não duplicar produto por causa de dois códigos externos.
- **Exceção iPhone:** o anúncio “iPhone 12 Pro Pro Max” tem nome ambíguo e não deve ser normalizado silenciosamente; iPhone 14 com bateria de **84%** é permitido desde que essa saúde seja mostrada com transparência, sem bloqueio arbitrário.
- Evidência estruturada: Supabase `public.import_batches.id = 74466170-6c0a-4835-81c1-995fce3aa064`, `status='review'`, com nomes, custos, links e referências de fotos de todas as **37 ofertas** da data.
- **Não declarar atualização completa** sem a publicação/validação de todas as ofertas vigentes. A ausência da operação de upload de WebP nos plugins disponíveis impediu concluir os novos cadastros nessa execução.

**Atenção:** quantidades de 21 Android / 16 iPhone são exclusivamente uma fotografia de 11/11/2026, e não um limite fixo ou expectativa para sincronizações futuras.
