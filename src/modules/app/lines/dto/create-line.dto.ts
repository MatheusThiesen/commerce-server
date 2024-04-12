import { IsNumber, IsString } from 'class-validator';
import { Line } from '../entities/line.entity';

export class CreateLineDto extends Line {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
}
