import { Controller, Get, UseGuards } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.topicsService.findAll();
  }
}
