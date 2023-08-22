export class PaymentCondition {
  codigo?: number;
  descricao?: string;
  valorMinimo?: number;
  quantidade?: number;
  eAtivo?: boolean;
  parcelas: {
    tabelaPreco?: number;
    sequencia?: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
