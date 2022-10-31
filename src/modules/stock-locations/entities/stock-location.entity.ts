export class StockLocation {
  id: string;
  periodo: string;
  descricao: string;
  quantidade: number;
  produtoCodigo: number;
  eAtivo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
