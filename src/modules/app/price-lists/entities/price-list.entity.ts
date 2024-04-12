export class PriceList {
  id: string;
  codigo: number;
  descricao: string;
  valor: number;
  eAtivo?: boolean;
  produtoCodigo: number;
  createdAt?: Date;
  updatedAt?: Date;
}
