import { Item } from './item.entity';

export class Order {
  codigo?: number;
  dataFaturamento: Date;
  valorTotal: number;
  eRascunho: boolean;
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
