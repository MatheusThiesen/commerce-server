export class Brand {
  codigo: number;
  descricao: string;
  eAtivo: boolean;
  createdAt?: Date;
  updatedAt?: Date;

  constructor() {
    if (this.eAtivo === undefined) {
      this.eAtivo = true;
    }
  }
}
