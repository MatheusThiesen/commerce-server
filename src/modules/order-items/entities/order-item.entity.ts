export class OrderItem {
  codigo: string;
  quantidade: number;
  valorUnitaro: number;
  valorTotal: number;
  situacao: number;
  sequencia: number;
  pedidoCodigo: number;
  produtoCodigo: number;
  createdAt?: Date;
  updatedAt?: Date;

  dataFaturmaneto: Date;
}
