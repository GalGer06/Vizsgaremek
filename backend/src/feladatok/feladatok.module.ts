import { Module } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { FeladatokController } from './feladatok.controller';
import { PrismaService } from 'src/prisma.service';
import { UserdatasModule } from 'src/userdatas/userdatas.module';

@Module({
  imports: [UserdatasModule],
  controllers: [FeladatokController],
  providers: [FeladatokService, PrismaService],
})
export class FeladatokModule {}
