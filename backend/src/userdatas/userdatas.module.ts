import { Module } from '@nestjs/common';
import { UserdatasService } from './userdatas.service';
import { UserdatasController } from './userdatas.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UserdatasController],
  providers: [UserdatasService, PrismaService],
})
export class UserdatasModule {}
