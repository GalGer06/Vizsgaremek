import { Injectable } from '@nestjs/common';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class UserdatasService {
  constructor (private prisma: PrismaService) {}

  async create(createUserdataDto: CreateUserdataDto) {
    return this.prisma.userDatas.create({
      data: createUserdataDto,
    });
  }

  async findAll() {
    return this.prisma.userDatas.findMany();
  }

  async findOne(id: number) {
    return this.prisma.userDatas.findUnique({
      where:{id}
    });
  }

  async update(id: number, updateUserdataDto: UpdateUserdataDto) {
    return this.prisma.userDatas.update({
      where: { id },
      data: updateUserdataDto,
    });
  }

  async remove(id: number) {
    return this.prisma.userDatas.delete({
      where: { id },
    });
  }
}
