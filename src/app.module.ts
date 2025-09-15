import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { MongooseModule } from '@nestjs/mongoose';
import { appConfigModule, dbConfig } from './configs/security.config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendModule } from './friends/friend.module';

@Module({
  imports: [
    ConfigModule.forRoot(appConfigModule),
    MongooseModule.forRootAsync(dbConfig),
    UserModule,
    AuthModule,
    ChatModule,
    FriendModule
  ],

  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
