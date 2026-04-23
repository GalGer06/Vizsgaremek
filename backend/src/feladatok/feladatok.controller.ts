import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { CreateFeladatokDto } from './dto/create-feladatok.dto';
import { UpdateFeladatokDto } from './dto/update-feladatok.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('feladatok')
@Controller('feladatok')
export class FeladatokController {
  constructor(private readonly feladatokService: FeladatokService) {}

  @Post()
  @ApiOperation({ summary: 'Új kérdés létrehozása' })
  create(@Body() createFeladatokDto: CreateFeladatokDto) {
    return this.feladatokService.create(createFeladatokDto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Összes kérdés lekérése' })
  findAll() {
    return this.feladatokService.findAll();
  }

  @Get('user/:userId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kérdések lekérése adott felhasználó számára (válasz állapotokkal)' })
  @ApiParam({ name: 'userId', description: 'Felhasználó egyedi azonosítója' })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Válasz rögzítése egy kérdésre' })
  @ApiParam({ name: 'id', description: 'Kérdés egyedi azonosítója' })
  @ApiBody({ 
    schema: {
        type: 'object',
        properties: {
          isCorrect: { type: 'boolean', example: true },
          selectedAnswer: { type: 'string', example: 'Az ózonpajzs véd a sugárzástól.' }
        }
    }
  })
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
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Napi kérdés lekérése' })
  findDaily(@Req() req: { user?: { userId?: number } }) {
    const userId = req.user?.userId;
    if (userId) {
      return this.feladatokService.findDailyForUser(userId);
    }
    return this.feladatokService.findDaily();
  }

  @Post('daily/:id/answer')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Napi válasz rögzítése egy kérdésre' })
  @ApiParam({ name: 'id', description: 'Kérdés egyedi azonosítója' })
  recordDailyAnswer(
    @Param('id') id: string,
    @Body('isCorrect') isCorrect: boolean,
    @Body('selectedAnswer') selectedAnswer: string,
    @Req() req: { user?: { userId?: number } }
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();
    return this.feladatokService.recordDailyAnswer(userId, +id, isCorrect, selectedAnswer);
  }

  @Post('reset-answers')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Felhasználó összes válaszának törlése (csak adminoknak)' })
  resetAnswers(@Req() req: { user?: { userId?: number; access?: boolean } }) {
    if (!req.user?.access) {
      throw new ForbiddenException('Csak adminok törölhetik a válaszaikat.');
    }
    const userId = req.user?.userId;
    if (!userId) throw new ForbiddenException();
    return this.feladatokService.resetUserAnswers(userId);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Egy kérdés lekérése ID alapján' })
  findOne(@Param('id') id: string) {
    return this.feladatokService.findOne(+id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Kérdés módosítása (csak adminoknak)' })
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
  @ApiOperation({ summary: 'Kérdés törlése' })
  remove(@Param('id') id: string) {
    return this.feladatokService.remove(+id);
  }
}
