import { ArrayMaxSize, ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeladatokDto {
  @ApiProperty({ example: 'Vízvédelem', description: 'A témakör címe' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Melyik a világ legmélyebb tava?', description: 'A kérdés szövege' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ 
    example: ['Bajkál-tó', 'Viktória-tó', 'Kaszpi-tenger', 'Balaton'], 
    description: 'Négy lehetséges válasz',
    type: [String],
    minItems: 4,
    maxItems: 4
  })
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  answers: string[];

  @ApiProperty({ example: 'Bajkál-tó', description: 'A helyes válasz' })
  @IsString()
  @IsNotEmpty()
  correct: string;

  @ApiProperty({ example: 'A Bajkál-tó mélysége több mint 1600 méter.', description: 'Érdekesség a válaszhoz' })
  @IsString()
  @IsNotEmpty()
  funfact: string;

  @ApiProperty({ example: 'Történelmi adatok a tóról...', description: 'Háttérinformációk' })
  @IsString()
  @IsNotEmpty()
  history: string;
}
