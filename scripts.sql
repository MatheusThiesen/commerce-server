CALL public.populate_preview_image();

CREATE
OR REPLACE PROCEDURE public.populate_preview_image() LANGUAGE plpgsql AS $ procedure $ declare f_cli record;

begin for f_cli in
select
  distinct i."produtoCodigo",
  i.nome
from
  "produtoImagens" i
where
  i.sequencia = 1 loop
update
  produtos
set
  "imagemPreview" = f_cli.nome
where
  codigo = f_cli."produtoCodigo";

end loop;

raise notice 'fim';

end;

$ procedure $;