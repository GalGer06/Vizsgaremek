import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TicketType {
  BUG = 'BUG',
  SUGGEST_QUESTION = 'SUGGEST_QUESTION',
}

export class CreateTicketDto {
  @ApiProperty({ enum: TicketType, example: 'BUG', description: 'A ticket típusa' })
  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @ApiProperty({ example: 'Nem tölt be a profilkép szerkesztő.', description: 'A hiba vagy javaslat leírása' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ 
    required: false, 
    example: { browser: 'Chrome', version: '120.0' }, 
    description: 'Opcionális melléklet (pl. technikai adatok vagy javasolt kérdés objektum)' 
  })
  @IsOptional()
  attachment?: any;
}
