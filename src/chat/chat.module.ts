import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { ChatGateway } from "./chat.gateway";
import { MongooseModule } from "@nestjs/mongoose";
import { Chat, ChatSchema } from "./schemas/chat.schema";
import { Message, MessageSchema } from "./schemas/message.schema";
import { FriendModule } from "src/friends/friend.module";
import { JwtModule } from "@nestjs/jwt";
import { jwtRegisterConfig } from "src/configs/security.config";
import { PresenceService } from "./presence.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      {name:Chat.name,schema: ChatSchema},
      {name:Message.name,schema:MessageSchema}
    ]),
    JwtModule.registerAsync(jwtRegisterConfig)
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, PresenceService],
  exports: [ChatService, ChatGateway],
})
export class ChatModule{}