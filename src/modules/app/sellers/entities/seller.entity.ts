import { TipoVendedor } from '@prisma/client';

export class Seller {
  usuarioId?: string;
  codigo: number;
  nome: string;
  nomeGuerra: string;
  email: string;
  codGerente?: number;
  codSupervisor?: number;
  eAtivo: boolean;
  eGerente: boolean;
  eSupervisor: boolean;
  tipoVendedor: TipoVendedor;
  createdAt?: Date;
  updatedAt?: Date;

  marcasCod?: number[];
}
