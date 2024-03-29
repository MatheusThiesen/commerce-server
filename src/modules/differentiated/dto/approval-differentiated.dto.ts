import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Differentiated } from '../entities/differentiated.entity';

export class approvalDifferentiatedDto extends Differentiated {
  @IsNotEmpty()
  @IsString()
  tipoDesconto: 'PERCENTUAL' | 'VALOR';

  @IsNumber()
  descontoPercentual: number;

  @IsNumber()
  descontoValor: number;

  @IsString()
  motivoDiferenciado: string;
}
