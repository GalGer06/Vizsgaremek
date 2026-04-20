import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'Rikimik', description: 'Felhasználónév vagy e-mail cím' })
  @IsString()
  @IsNotEmpty()
  usernameOrEmail: string;

  @ApiProperty({ example: 'admin1234', description: 'Jelszó' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
