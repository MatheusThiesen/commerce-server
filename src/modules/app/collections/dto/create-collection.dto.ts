import { IsNumber, IsString } from 'class-validator';
import { Collection } from '../entities/collection.entity';

export class CreateCollectionDto extends Collection {
  @IsNumber()
  codigo: number;
  @IsString()
  descricao: string;
}
