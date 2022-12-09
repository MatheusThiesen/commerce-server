import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { RegExHelper } from '../../../helpers/regex.helper';

export class PasswordDto {
  @IsNotEmpty()
  @IsString()
  antigaSenha: string;

  @IsNotEmpty()
  @Matches(RegExHelper.password)
  senha: string;
}
