import { IsNumber, IsString } from 'class-validator';
import { Brand } from '../entities/brand.entity';
export class CreateBrandDto extends Brand {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
}
