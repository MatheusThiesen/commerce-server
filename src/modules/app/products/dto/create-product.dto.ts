import { IsNumber, IsString } from 'class-validator';
import { Product } from '../entities/product.entity';

export class CreateProductDto extends Product {
  @IsNumber()
  codigo: number;
  @IsString()
  codigoAlternativo: string;
  @IsString()
  referencia: string;
  @IsString()
  descricao: string;
  @IsString()
  descricaoComplementar: string;
  @IsNumber()
  precoVenda: number;
  @IsNumber()
  marcaCodigo: number;
}
