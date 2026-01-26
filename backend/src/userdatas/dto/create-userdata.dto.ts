import { IsInt, IsOptional, Min } from "class-validator";

export class CreateUserdataDto {
  @IsInt()
  userId: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  streak?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalPoints?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  level?: number;
}
