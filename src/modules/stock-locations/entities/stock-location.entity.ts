export class StockLocation {
  id: string;
  periodo: string;
  descricao: string;
  quantidade: number;
  produtoCodigo: number;
  eAtivo?: boolean;
  data: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
