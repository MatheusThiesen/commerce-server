export class Product {
  codigo: number;
  codigoAlternativo: string;
  referencia: string;
  descricao: string;
  descricaoComplementar: string;
  descricaoAdicional?: string;
  precoVenda: number;
  unidade: string;
  eAtivo?: boolean;
  possuiFoto?: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  marcaCodigo: number;
  corPrimariaCodigo?: number;
  corSecundariaCodigo?: number;
  colecaoCodigo?: number;
  linhaCodigo?: number;
  grupoCodigo?: number;
  subgrupoCodigo?: number;
}
