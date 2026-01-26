import { Module } from '@nestjs/common';
import { UserdatasService } from './userdatas.service';
import { UserdatasController } from './userdatas.controller';

@Module({
  controllers: [UserdatasController],
  providers: [UserdatasService],
})
export class UserdatasModule {}
