import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  FriendRequest,
  FriendRequestDocument,
  FriendRequestStatus,
} from './schema/friend-request.schema';
import { User } from 'src/user/schema/user.schema';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class FriendService {
  constructor(
    @InjectModel(FriendRequest.name)
    private friendModel: Model<FriendRequestDocument>,
    @InjectModel(User.name)
    private userModel: Model<User>,
    private readonly chatservice: ChatService,
  ) {}

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) {
      throw new BadRequestException('You cannot friend yourself');
    }
    const existingChat = await this.chatservice.checkExistingChat(
      senderId,
      receiverId,
    );
    if (existingChat) {
      throw new BadRequestException('You are already friends');
    }

    const existingRequest = await this.friendModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: FriendRequestStatus.PENDING,
    });

    if (existingRequest) {
      throw new BadRequestException('Friend request already sent');
    }
    const receiver = await this.userModel.findById(receiverId);
    if (!receiver) throw new NotFoundException('User not found');

    try {
      const request = await this.friendModel.create({
        sender: senderId,
        receiver: receiverId,
      });
      return { success: true, message: 'friend request send successfully!' };
    } catch (err) {
      throw new BadRequestException('Friend request already sent');
    }
  }

  async respondRequest(requestId: string, userId: string, accept: boolean) {
    const request = await this.friendModel.findById(requestId);
    if (!request) throw new NotFoundException('Request not found');

    if (request.receiver.toString() !== userId) {
      throw new BadRequestException('Not your request to respond');
    }
    request.status = accept
      ? FriendRequestStatus.ACCEPTED
      : FriendRequestStatus.REJECTED;
    if (accept && request.status === FriendRequestStatus.ACCEPTED) {
      await this.chatservice.createChat(userId, {
        userId: request.sender.toString(),
      });
      await this.friendModel.findByIdAndDelete(requestId);
      return {
        success: true,
        message: 'friend request accepted successfully!',
      };
    }
    if (!accept && request.status === FriendRequestStatus.REJECTED) {
      await this.friendModel.findByIdAndDelete(requestId);
      return {
        success: true,
        message: 'friend request rejected successfully!',
      };
    }
    await request.save();
    return request;
  }

  async getFriends(userId: string) {
    const requests = await this.friendModel
      .find({
        $or: [
          { sender: userId, status: FriendRequestStatus.ACCEPTED },
          { receiver: userId, status: FriendRequestStatus.ACCEPTED },
        ],
      })
      .populate('sender receiver', 'username email')
      .lean();

    return requests.map((r) => {
      const sender = r.sender as any;
      const receiver = r.receiver as any;

      const friend = sender._id.toString() === userId ? receiver : sender;
      return {
        id: friend._id.toString(),
        username: friend.username,
        email: friend.email,
      };
    });
  }

  async getPendingRequests(userId: string) {
    return this.friendModel
      .find({
        receiver: userId,
        status: FriendRequestStatus.PENDING,
      })
      .populate('sender', 'username email');
  }
}
