import { IsNumber, IsString } from 'class-validator';
import { Subgroup } from '../entities/subgroup.entity';

export class CreateSubgroupDto extends Subgroup {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
  @IsNumber()
  codigoGrupo: number;
}
