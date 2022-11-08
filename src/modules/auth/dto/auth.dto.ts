import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { RegExHelper } from '../../../helpers/regex.helper';

export class AuthDto {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password)
  senha: string;
}
