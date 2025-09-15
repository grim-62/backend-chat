import { Module } from "@nestjs/common";
import { FriendRequest, FriendRequestSchema } from "./schema/friend-request.schema";
import { FriendController } from "./friend.controller";
import { FriendService } from "./friend.service";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "src/user/schema/user.schema";
import { ChatService } from "src/chat/chat.service";
import { ChatModule } from "src/chat/chat.module";


@Module({
  imports: [
    MongooseModule.forFeature([{ name: FriendRequest.name, schema: FriendRequestSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ChatModule,
  ],
  controllers: [FriendController],
  providers: [FriendService],
  exports: [],
})
export class FriendModule {}