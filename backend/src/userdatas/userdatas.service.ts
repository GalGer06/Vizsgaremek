import { Injectable } from '@nestjs/common';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';

@Injectable()
export class UserdatasService {
  create(createUserdataDto: CreateUserdataDto) {
    return 'This action adds a new userdata';
  }

  findAll() {
    return `This action returns all userdatas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userdata`;
  }

  update(id: number, updateUserdataDto: UpdateUserdataDto) {
    return `This action updates a #${id} userdata`;
  }

  remove(id: number) {
    return `This action removes a #${id} userdata`;
  }
}
