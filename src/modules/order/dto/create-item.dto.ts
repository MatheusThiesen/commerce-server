import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsNotEmpty()
  @IsNumber()
  produtoCodigo;
  @IsNotEmpty()
  @IsNumber()
  quantidade;
  @IsNotEmpty()
  @IsNumber()
  valorUnitario;
}
