import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class SignInDto {
  @IsUUID()
  id: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
