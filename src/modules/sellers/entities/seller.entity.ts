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
  createdAt?: Date;
  updatedAt?: Date;
}
