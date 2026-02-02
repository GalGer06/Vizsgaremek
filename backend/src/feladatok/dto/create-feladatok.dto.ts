import { IsNotEmpty, IsString, IsObject } from "class-validator";

export class CreateFeladatokDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsObject()
  @IsNotEmpty()
  answers: object;

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
