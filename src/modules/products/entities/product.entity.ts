export class Product {
  codigo: number;
  codigoAlternativo: string;
  referencia: string;
  descricao: string;
  descricaoComplementar: string;
  descricaoAdicional?: string;
  precoVenda: number;
  precoVendaEmpresa?: number;
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
  subGrupoId?: string;
  qtdEmbalagem?: number;
  obs?: string;
  ncm?: string;
  unidadeMedida?: string;
  unidadeMedidaDescricao?: string;
}
