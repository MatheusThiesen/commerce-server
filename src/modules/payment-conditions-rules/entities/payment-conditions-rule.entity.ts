export class PaymentConditionsRule {
  id?: string;
  condicaoPagamentoCodigo: number;
  marcaCodigo: number;
  localCobrancaCodigo: number;
  listaPrecoCodigo: number;
  valorMinimo?: number;
  eAtivo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
