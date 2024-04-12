import { IsNotEmpty, IsString } from 'class-validator';

export class AuthGetPinDto {
  @IsNotEmpty()
  @IsString()
  email: string;
}

export class AuthSessionDto {
  @IsNotEmpty()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsString()
  pin: string;
}
