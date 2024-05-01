export class Billet {
  id?: string;
  numeroDocumento: number;
  valor: number;
  desdobramento: number;
  parcela: number;
  nossoNumero: string;
  dataVencimento: Date;
  dataPagamento?: Date;

  vendedorCodigo: number;
  clienteCodigo: number;
}
