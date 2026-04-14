import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

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

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findAllForUser(
    @Param('userId') userId: string,
    @Req() req: { user?: { userId?: number } }
  ) {
    const targetUserId = +userId;
    if (req.user?.userId !== targetUserId) {
      throw new ForbiddenException('Csak a saját válaszaidat láthatod.');
    }
    
    // Pass date string as seed suffix for daily question stability if needed
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    return this.feladatokService.findAllForUser(targetUserId, dateString);
  }

  @Post(':id/answer')
  @UseGuards(JwtAuthGuard)
  recordAnswer(
    @Param('id') id: string,
    @Body('isCorrect') isCorrect: boolean,
    @Body('selectedAnswer') selectedAnswer: string,
    @Req() req: { user?: { userId?: number } }
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();
    return this.feladatokService.recordAnswer(userId, +id, isCorrect, selectedAnswer);
  }

  @Get('daily')
  findDaily() {
    return this.feladatokService.findDaily();
  }

  @Post('reset-answers')
  @UseGuards(JwtAuthGuard)
  resetAnswers(@Req() req: { user?: { userId?: number; access?: boolean } }) {
    if (!req.user?.access) {
      throw new ForbiddenException('Csak adminok törölhetik a válaszaikat.');
    }
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();
    return this.feladatokService.resetUserAnswers(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.feladatokService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateFeladatokDto: UpdateFeladatokDto,
    @Req() req: { user?: { access?: boolean } }
  ) {
    if (!req.user?.access) {
      throw new ForbiddenException('Csak adminok módosíthatják a kérdéseket.');
    }
    return this.feladatokService.update(+id, updateFeladatokDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.feladatokService.remove(+id);
  }
}
