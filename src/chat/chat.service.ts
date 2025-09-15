import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Model } from 'mongoose';
import {
  CreateChatDto,
  CreateGroupChatDto,
  UpdateChatDto,
} from './dto/chat.dto';
import { PresenceService } from './presence.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    private readonly presenceService: PresenceService,
  ) {}

  async checkExistingChat(userId: string, senderId: string) {
    return this.chatModel.findOne({
      isGroup: false,
      users: { $all: [userId, senderId], $size: 2 },
    });
  }

  async createChat(userId: string, dto: CreateChatDto) {
    if (userId === dto.userId) {
      throw new BadRequestException('You cannot create a chat with yourself');
    }

    const existingChat = await this.chatModel
      .findOne({
        isGroup: false,
        users: { $all: [userId, dto.userId], $size: 2 },
      })
      .populate('users')
      .populate('lastMessage')
      .exec();

    if (existingChat) {
      return existingChat;
    }

    const newChat = await this.chatModel.create({
      chatName: 'directChat',
      isGroup: false,
      users: [userId, dto.userId],
    });

    return this.chatModel.findById(newChat._id).populate('users').exec();
  }

  async createGroupChat(adminId: string, dto: CreateGroupChatDto) {
    if (!dto.users || dto.users.length < 2) {
      throw new BadRequestException(
        'A group chat requires at least 3 members (including the admin)',
      );
    }
    const users = [...new Set([...dto.users, adminId])];

    const newGroupChat = await this.chatModel.create({
      chatName: dto.chatName,
      isGroup: true,
      users: users,
      groupAdmin: [adminId],
    });
    return this.chatModel
      .findById(newGroupChat._id)
      .populate('users')
      .populate('groupAdmin')
      .exec();
  }

  async addTogroupChat(chatId: string, userId: string) {
    const chat = await this.chatModel
      .findByIdAndUpdate(
        chatId,
        { $addToSet: { users: userId } },
        { new: true },
      )
      .populate('users')
      .exec();

    return chat;
  }

  async removeFromGroupChat(chatId: string, userId: string) {
    const chat = await this.chatModel
      .findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
      .populate('users')
      .exec();

    return chat;
  }

  async getUserDirectChats(userId: string) {
    const chats = await this.chatModel
      .find({
        isGroup: false,
        users: { $all: [userId], $size: 2 },
      })
      .populate('users', 'profileImage email username')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();

    return chats.map((chat: any) => {
      const otherMember = chat.users.filter(
        (u: any) => u._id.toString() !== userId,
      );

      const otherUser = otherMember[0];

      return {
        _id: chat._id,
        isGroup: chat.isGroup,
        email: otherUser?.email,
        username: chat.isGroup ? chat.chatName : otherUser?.username,
        profileImage: chat.isGroup
          ? chat.users.slice(0, 3).map((e: any) => e.profileImage)
          : otherUser?.profileImage,
        members: chat.users
          .filter((item: any) => item._id.toString() !== userId)
          .map((i: any) => i._id),
        lastMessage: chat.lastMessage,
        updatedAt: chat.updatedAt,
        online: otherUser
          ? this.presenceService.isOnline(otherUser._id.toString())
          : false,
      };
    });
  }

  async getUserGroupChats(userId: string) {
    return this.chatModel
      .find({
        isGroup: true,
        users: { $all: [userId] },
      })
      .populate('users')
      .populate('groupAdmin')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findChatById(id: string) {
    return this.chatModel.findById(id).exec();
  }

  async updateChat(id: string, chatDto: UpdateChatDto) {
    return this.chatModel.findByIdAndUpdate(id, chatDto, { new: true }).exec();
  }

  async deleteChat(id: string) {
    return this.chatModel.findByIdAndDelete(id).exec();
  }
}
