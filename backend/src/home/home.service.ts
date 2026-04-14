import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  async getHomeButtons() {
    return this.prisma.home_button.findMany({
      orderBy: {
        order: 'asc',
      },
    });
  }
}
