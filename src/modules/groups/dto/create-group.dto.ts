import { IsNumber, IsString } from 'class-validator';
import { Group } from './../entities/group.entity';
export class CreateGroupDto extends Group {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
}
