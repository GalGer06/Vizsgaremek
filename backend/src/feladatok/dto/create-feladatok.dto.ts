import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateFeladatokDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  answers: string[];

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
