import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserdatasService } from './userdatas.service';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';

@Controller('userdatas')
export class UserdatasController {
  constructor(private readonly userdatasService: UserdatasService) {}

  @Post()
  create(@Body() createUserdataDto: CreateUserdataDto) {
    return this.userdatasService.create(createUserdataDto);
  }

  @Get()
  findAll() {
    return this.userdatasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userdatasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserdataDto: UpdateUserdataDto) {
    return this.userdatasService.update(+id, updateUserdataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userdatasService.remove(+id);
  }
}
