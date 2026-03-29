import { IsArray } from 'class-validator';

export class UpdateAchievementsDto {
  @IsArray()
  achievements: unknown[];
}
