import { IsEmail, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @MaxLength(255)
  email: string;

  @IsNotEmpty()
  @MaxLength(50)
  username: string;

  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password: string;
}

