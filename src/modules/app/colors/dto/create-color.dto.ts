import { IsNumber, IsString } from 'class-validator';
import { Color } from '../entities/color.entity';

export class CreateColorDto extends Color {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
  @IsString()
  hex: string;
}
