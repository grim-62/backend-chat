import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { PresenceService } from './presence.service';
import {
  SOCKET_EVENT_NEW_MESSAGE,
  SOCKET_EVENT_NEW_MESSAGE_ALERT,
  SOCKET_EVENT_TYPING_START,
  SOCKET_EVENT_TYPING_END,
  SOCKET_EVENT_ONLINE_USERS,
} from './socket.constants';
import { v4 as uuid } from 'uuid';
import { Message } from './schemas/message.schema'; // adjust import path

@WebSocketGateway({
  cors: { origin: '*' }, // ⚠️ Restrict in production
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  // ✅ Connection handler
  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      this.logger.warn(`Socket ${client.id} tried to connect without userId`);
      client.disconnect(true);
      return;
    }

    this.presenceService.addUser(userId, client.id);
    this.logger.log(`User ${userId} connected (socket: ${client.id})`);

    this.server.emit(SOCKET_EVENT_ONLINE_USERS, {
      onlineUsers: this.presenceService.getOnlineUsers(),
    });
  }

  // ✅ Disconnect handler
  async handleDisconnect(client: Socket) {
    const userId = [...this.presenceService.getOnlineUsers()].find((id) =>
      this.presenceService.getSocketIds(id).includes(client.id),
    );

    if (userId) {
      this.presenceService.removeUser(userId, client.id);
      this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);

      this.server.emit(SOCKET_EVENT_ONLINE_USERS, {
        onlineUsers: this.presenceService.getOnlineUsers(),
      });
    }
  }

  // ✅ Send new message
  @SubscribeMessage(SOCKET_EVENT_NEW_MESSAGE)
  async handleNewMessage(
    @MessageBody()
    data: { chatId: string; message: string; members: string[]; sender: { _id: string; name: string } },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { chatId, message, members, sender } = data;

      // For real-time clients
      const messageForRealTime = {
        content: message,
        _id: uuid(),
        sender: { _id: sender._id, name: sender.name },
        chat: chatId,
        createdAt: new Date().toISOString(),
      };

      // For DB
      const messageForDB = {
        content: message,
        sender: sender._id,
        chat: chatId,
      };

      // Find sockets of all members
      const userSockets = members.flatMap((id) => this.presenceService.getSocketIds(id));

      if (userSockets.length > 0) {
        this.server.to(userSockets).emit(SOCKET_EVENT_NEW_MESSAGE, {
          message: messageForRealTime,
          chatId,
        });

        this.server.to(userSockets).emit(SOCKET_EVENT_NEW_MESSAGE_ALERT, { chatId });

        this.logger.log(
          `Delivered NEW_MESSAGE to chat ${chatId} (members: ${members.length}, sockets: ${userSockets.length})`,
        );
      }

      // Save message in DB
      // await Message.create(messageForDB);
    } catch (err) {
      this.logger.error(`Error in handleNewMessage: ${err.message}`, err.stack);
    }
  }

  // ✅ Typing start
  @SubscribeMessage(SOCKET_EVENT_TYPING_START)
  async handleTypingStart(
    @MessageBody() data: { chatId: string; members: string[]; senderId: string },
  ) {
    const { chatId, members, senderId } = data;

    const userSockets = members.flatMap((id) => this.presenceService.getSocketIds(id));
    if (userSockets.length > 0) {
      this.server.to(userSockets).emit(SOCKET_EVENT_TYPING_START, {
        chatId,
        user: senderId,
      });
    }
  }

  // ✅ Typing end
  @SubscribeMessage(SOCKET_EVENT_TYPING_END)
  async handleTypingEnd(
    @MessageBody() data: { chatId: string; members: string[]; senderId: string },
  ) {
    const { chatId, members, senderId } = data;

    const userSockets = members.flatMap((id) => this.presenceService.getSocketIds(id));
    if (userSockets.length > 0) {
      this.server.to(userSockets).emit(SOCKET_EVENT_TYPING_END, {
        chatId,
        user: senderId,
      });
    }
  }
}
