import { Injectable } from '@nestjs/common';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';

@Injectable()
export class FeladatokService {
  create(createFeladatokDto: CreateFeladatokDto) {
    return 'This action adds a new feladatok';
  }

  findAll() {
    return `This action returns all feladatok`;
  }

  findOne(id: number) {
    return `This action returns a #${id} feladatok`;
  }

  update(id: number, updateFeladatokDto: UpdateFeladatokDto) {
    return `This action updates a #${id} feladatok`;
  }

  remove(id: number) {
    return `This action removes a #${id} feladatok`;
  }
}
