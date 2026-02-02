import { Injectable } from '@nestjs/common';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FeladatokService {
  constructor (private prisma: PrismaService) {}

  async create(createFeladatokDto: CreateFeladatokDto) {
    return this.prisma.feladatok.create({
      data: createFeladatokDto,
    });
  }

  async findAll() {
    return this.prisma.feladatok.findMany();
  }

  async findOne(id: number) {
    return this.prisma.feladatok.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateFeladatokDto: UpdateFeladatokDto) {
    return this.prisma.feladatok.update({
      where: { id },
      data: updateFeladatokDto,
    });
  }

  async remove(id: number) {
    return this.prisma.feladatok.delete({
      where: { id },
    });
  }
}
