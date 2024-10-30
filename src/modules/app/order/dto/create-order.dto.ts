import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Item } from '../entities/item.entity';
import { Order } from '../entities/order.entity';
import { CreateItemDto } from './create-item.dto';

export class CreateOrderDto extends Order {
  @IsNotEmpty()
  @IsNumber()
  clienteCodigo;
  @IsNotEmpty()
  @IsNumber()
  marcaCodigo;
  @IsNotEmpty()
  @IsNumber()
  condicaoPagamentoCodigo;
  @IsNotEmpty()
  @IsString()
  periodoEstoque;
  @IsNotEmpty()
  @IsNumber()
  tabelaPrecoCodigo;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => CreateItemDto)
  itens: Item[];
}
