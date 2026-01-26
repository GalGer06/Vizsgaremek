import { PartialType } from '@nestjs/mapped-types';
import { CreateFeladatokDto } from './create-feladatok.dto';

export class UpdateFeladatokDto extends PartialType(CreateFeladatokDto) {}
