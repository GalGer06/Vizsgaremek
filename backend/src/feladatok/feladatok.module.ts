import { Module } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { FeladatokController } from './feladatok.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [FeladatokController],
  providers: [FeladatokService, PrismaService],
})
export class FeladatokModule {}
