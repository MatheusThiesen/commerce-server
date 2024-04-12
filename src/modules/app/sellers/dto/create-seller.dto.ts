import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Seller } from '../entities/seller.entity';

export class CreateSellerDto extends Seller {
  @IsNotEmpty()
  @IsNumber()
  codigo: number;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  nomeGuerra: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;
}
