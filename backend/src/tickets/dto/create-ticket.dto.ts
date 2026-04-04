import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum TicketType {
  BUG = 'BUG',
  SUGGEST_QUESTION = 'SUGGEST_QUESTION',
}

export class CreateTicketDto {
  @IsEnum(TicketType)
  @IsNotEmpty()
  type: TicketType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  attachment?: any;
}
