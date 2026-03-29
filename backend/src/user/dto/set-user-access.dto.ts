import { IsBoolean } from 'class-validator';

export class SetUserAccessDto {
  @IsBoolean()
  access: boolean;
}
