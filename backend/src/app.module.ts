import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { FeladatokModule } from './feladatok/feladatok.module';
import { UserdatasModule } from './userdatas/userdatas.module';
import { AuthModule } from './auth/auth.module';
import { TicketsModule } from './tickets/tickets.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
  }), UserModule, FeladatokModule, UserdatasModule, AuthModule, TicketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
