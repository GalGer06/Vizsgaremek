import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Teszt Elek', description: 'Teljes név' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'tesztelek', description: 'Felhasználónév' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'teszt@elek.hu', description: 'E-mail cím' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'jelszo123', description: 'Jelszó (minimum 6 karakter)', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
