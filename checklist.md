# Refatorações

- [x] Renomear tabela de "ListaPreco" > "ListaPrecoProduto";
- [x] Criar "LocalEstoque", apenas constando os locais (Ex: "2023-01", "pronta-entrega", etc);
- [ ] Criar "ListaPreco", apenas constando as listas (Ex: "Lista 28", "Lista 56", etc);

# Pedido

- [x] Tabela para receber pedido (Pedido, ItemPedido), levantar campos;
- [x] Endpoint entregar condições de pagamento para um pedido;
- [ ] Endpoint valor mínimo de pedido por marca;
- [ ] Tabela "Marca" adicionar bloqueios por "Estados" e "LocalEstoque", que ira bloquear no momento da listagem de produtos;
- [ ] Criar tabela de "Estados" e vincular clientes a estados;

# Tabela Pedido

- [x] ID interno UUID
- [x] Cod interno numérico
- [x] data faturamento
- [x] Cliente
- [x] itens[]
- [x] eRascunho
- [x] valorTotal
- [x] Condição pagamento
- [x] Log API[]
- [x] Vendedor = tipo 1
- [x] Preposto = tipo 2
- [x] Tabela preço
- [x] Local Estoque

- [ ] Situação

Itens

- [x] ID interno UUID
- [x] Produto
- [x] preço unitário
- [x] quantidade
- [x] sequencia

Situação

- [ ] Cod interno numérico
- [ ] descrição

Log da API

- [x] request
- [x] response
- [x] statusCode
