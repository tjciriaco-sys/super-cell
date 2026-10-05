-- Keep shared product copy truthful when different used-device conditions coexist.
-- Battery, originality, opening history and warranty belong to each sellable variant.
update public.products
set description = 'iPhone seminovo revisado pela Super Cell. Consulte nesta página a condição, a bateria mínima, a originalidade, o histórico de abertura e a garantia da opção selecionada.'
where condition = 'seminovo'
  and brand_id = (select id from public.brands where slug = 'apple');
