import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { RegExHelper } from '../../../helpers/regex.helper';
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

  @IsNotEmpty()
  @Matches(RegExHelper.password)
  password: string;
}
