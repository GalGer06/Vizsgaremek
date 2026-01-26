import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';

@Controller('feladatok')
export class FeladatokController {
  constructor(private readonly feladatokService: FeladatokService) {}

  @Post()
  create(@Body() createFeladatokDto: CreateFeladatokDto) {
    return this.feladatokService.create(createFeladatokDto);
  }

  @Get()
  findAll() {
    return this.feladatokService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feladatokService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFeladatokDto: UpdateFeladatokDto) {
    return this.feladatokService.update(+id, updateFeladatokDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feladatokService.remove(+id);
  }
}
