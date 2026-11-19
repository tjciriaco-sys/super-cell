# Guanacel — três catálogos oficiais da Supercell RN

**Decisão comercial:** 11/11/2026. **Fornecedor exclusivo de celulares:** Guanacel (F1). Esta regra vigora para todas as próximas solicitações de atualização do catálogo, sem precisar recolher os links novamente.

## Regra nova e prioritária — 19/11/2026

O gestor autorizou cadastro e publicação automática em produção de novos produtos e variantes verificados dos três catálogos Guanacel, SEM solicitar homologação individual. A prioridade é não perder vendas por atraso de cadastro. Preferir fotografia real do fornecedor convertida e hospedada como WebP própria; se não houver acesso técnico para converter ou subir a foto no momento, usar provisoriamente a própria foto do anúncio oficial, guardando a origem e sinalizando pendência de internalização. Se não houver foto utilizável, exibir placeholder honesto, nunca foto de outro item.

A autorização NÃO dispensa conciliação por código/UUID, conferência de variante, condição, custo, cálculo, disponibilidade nem integridade de dados. Origem, modelo, preço ou configuração materialmente ambíguos exigem pesquisa adicional e não devem ser inventados. A exceção do banco para ofertas comprovadamente F1/F4 é definida pela migração 20261119150000_guanacel_autopublish_official_sources.sql e mantém os bloqueios normais para outros fornecedores. Não altera autorização de mudanças de layout, infraestrutura ou preço manual.

A fonte de perfumes agora integra a sincronização oficial: https://meucomercio.com.br/PERFUME2026 (Guana Perfumes, F4). Androids/eletrônicos: https://meucomercio.com.br/GUANACELL08 (F1). iPhones: https://guanacell2025.rdi.store/products (F1).

Este parágrafo substitui somente as instruções abaixo que exigiam aguardar foto WebP própria ou aprovação humana para publicar uma oferta Guanacel bem identificada. A normalização própria permanece recomendada e deve ser realizada automaticamente quando possível.

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
