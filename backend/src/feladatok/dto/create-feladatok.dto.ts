import { IsNotEmpty, IsString } from "class-validator";

export class CreateFeladatokDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;

  @IsString()
  @IsNotEmpty()
  correct: string;

  @IsString()
  @IsNotEmpty()
  funfact: string;

  @IsString()
  @IsNotEmpty()
  history: string;
}
