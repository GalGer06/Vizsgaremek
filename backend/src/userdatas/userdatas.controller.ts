import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserdatasService } from './userdatas.service';
import { CreateUserdataDto } from './dto/create-userdata.dto';
import { UpdateUserdataDto } from './dto/update-userdata.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateAchievementsDto } from './dto/update-achievements.dto';

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

  @Get('user/:userId/achievements')
  @UseGuards(JwtAuthGuard)
  findAchievementsByUserId(
    @Param('userId') userId: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +userId;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only view your own achievements');
    }

    return this.userdatasService.getAchievementsByUserId(targetUserId);
  }

  @Patch('user/:userId/achievements')
  @UseGuards(JwtAuthGuard)
  updateAchievementsByUserId(
    @Param('userId') userId: string,
    @Body() updateAchievementsDto: UpdateAchievementsDto,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +userId;
    const isAdmin = !!req.user?.access;

    if (!isAdmin) {
      throw new ForbiddenException('Only admin can change achievement status');
    }

    return this.userdatasService.updateAchievementsByUserId(
      targetUserId,
      updateAchievementsDto.achievements,
    );
  }

  @Post('user/:userId/achievements/:id/complete')
  @UseGuards(JwtAuthGuard)
  markAchievementCompleted(
    @Param('userId') userId: string,
    @Param('id') achievementId: string,
    @Req() req: { user?: { userId?: number } },
  ) {
    const targetUserId = +userId;
    const requesterId = req.user?.userId;

    if (requesterId !== targetUserId) {
      throw new ForbiddenException('You can only mark your own achievements');
    }

    return this.userdatasService.markAchievementCompleted(targetUserId, +achievementId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserdataDto: UpdateUserdataDto, @Req() req: { user?: { access?: boolean } }) {
    if (!req.user?.access) {
      throw new ForbiddenException('Only admin can update UserDatas directly.');
    }
    return this.userdatasService.update(+id, updateUserdataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userdatasService.remove(+id);
  }

  @Patch('user/:userId/points')
  @UseGuards(JwtAuthGuard)
  incrementPoints(
    @Param('userId') userId: string,
    @Body('points') points: number,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +userId;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('Csak a saját vagy mások pontjait adminisztrátorként növelheted.');
    }

    return this.userdatasService.incrementPoints(targetUserId, points);
  }

  @Post('user/:userId/recalculate')
  @UseGuards(JwtAuthGuard)
  recalculatePoints(
    @Param('userId') userId: string,
    @Req() req: { user?: { userId?: number; access?: boolean } },
  ) {
    const targetUserId = +userId;
    const requesterId = req.user?.userId;
    const isAdmin = !!req.user?.access;

    if (requesterId !== targetUserId && !isAdmin) {
      throw new ForbiddenException('You can only recalculate your own points.');
    }

    return this.userdatasService.recalculatePoints(targetUserId);
  }
}
