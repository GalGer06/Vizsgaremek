import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TopicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.topic.findMany();
  }
}
