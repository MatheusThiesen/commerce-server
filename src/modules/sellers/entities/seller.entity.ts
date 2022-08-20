export class Seller {
  codigo: number;
  nome: string;
  nomeGuerra: string;
  email: string;
  password: string;
  codGerente?: number;
  codSupervisor?: number;
  eAtivo: boolean;
  eGerente: boolean;
  eSupervisor: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
