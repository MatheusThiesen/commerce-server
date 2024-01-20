import { Item } from './item.entity';

export class Order {
  codigo?: number;
  dataFaturamento: Date;
  valorTotal: number;
  eRascunho: boolean;
  rascunhoCodigo?: number;
  marcaCodigo: number;
  clienteCodigo: number;
  localCobrancaCodigo: number;
  tabelaPrecoCodigo: number;
  vendedorCodigo: number;
  prepostoCodigo: number;
  condicaoPagamentoCodigo: number;
  periodoEstoque: string;

  itens: Item[];
}
