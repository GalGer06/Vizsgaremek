import { Module } from '@nestjs/common';
import { FeladatokService } from './feladatok.service';
import { FeladatokController } from './feladatok.controller';

@Module({
  controllers: [FeladatokController],
  providers: [FeladatokService],
})
export class FeladatokModule {}
