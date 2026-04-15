import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from 'src/prisma.service';
import { UserdatasModule } from 'src/userdatas/userdatas.module';

@Module({
  imports: [UserdatasModule],
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class UserModule {}
