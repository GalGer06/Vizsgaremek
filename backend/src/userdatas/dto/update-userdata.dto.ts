import { PartialType } from '@nestjs/mapped-types';
import { CreateUserdataDto } from './create-userdata.dto';

export class UpdateUserdataDto extends PartialType(CreateUserdataDto) {}
