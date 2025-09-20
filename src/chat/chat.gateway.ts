import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PresenceService } from './presence.service';
import {
  SOCKET_EVENT_CONNECT,
  SOCKET_EVENT_DISCONNECT,
  SOCKET_EVENT_MESSAGE,
  SOCKET_EVENT_JOIN,
  SOCKET_EVENT_LEAVE,
  SOCKET_EVENT_TYPING,
  SOCKET_EVENT_STOP_TYPING,
  SOCKET_EVENT_ERROR,
  SOCKET_EVENT_ALERT,
  SOCKET_EVENT_REFETCH_CHATS,
  SOCKET_EVENT_NEW_ATTACHMENTS,
  SOCKET_EVENT_NEW_MESSAGE_ALERT,
  SOCKET_EVENT_NEW_REQUEST,
} from './socket.constants';

@WebSocketGateway({
  cors: {
    origin: '*', // ⚠️ restrict to frontend URL in production
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  async handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) {
      this.logger.warn(`Connection attempt without userId, disconnecting socket ${client.id}`);
      client.disconnect(true);
      return;
    }

    this.presenceService.addUser(userId, client.id);
    this.logger.log(`User ${userId} connected (socket: ${client.id})`);

    this.server.emit(SOCKET_EVENT_JOIN, { userId });
    this.logger.log(`Emitted ${SOCKET_EVENT_JOIN} for user ${userId}`);
  }

  async handleDisconnect(client: Socket) {
    const userId = [...this.presenceService.getOnlineUsers()].find(
      (id) => this.presenceService.getSocketId(id) === client.id,
    );

    if (userId) {
      this.presenceService.removeUser(userId);
      this.logger.log(`User ${userId} disconnected (socket: ${client.id})`);
      this.server.emit(SOCKET_EVENT_LEAVE, { userId });
      this.logger.log(`Emitted ${SOCKET_EVENT_LEAVE} for user ${userId}`);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_MESSAGE)
  async handleMessage(
    @MessageBody()
    data: { senderId: string; recipientId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, recipientId, message } = data;
    this.logger.debug(`Message from ${senderId} to ${recipientId}: ${message}`);

    client.emit(SOCKET_EVENT_MESSAGE, { senderId, recipientId, message });
    this.logger.log(`Emitted ${SOCKET_EVENT_MESSAGE} to sender ${senderId}`);

    const recipientSocketId = this.presenceService.getSocketId(recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit(SOCKET_EVENT_MESSAGE, {
        senderId,
        message,
      });
      this.logger.log(`Emitted ${SOCKET_EVENT_MESSAGE} to recipient ${recipientId}`);

      this.server.to(recipientSocketId).emit(SOCKET_EVENT_NEW_MESSAGE_ALERT, { senderId, message });
      this.logger.log(`Emitted ${SOCKET_EVENT_NEW_MESSAGE_ALERT} to recipient ${recipientId}`);
    } else {
      this.logger.warn(`Recipient ${recipientId} is offline, storing message in DB later`);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_TYPING)
  async handleTypingStart(@MessageBody() data: { senderId: string; recipientId: string }) {
    const socketId = this.presenceService.getSocketId(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit(SOCKET_EVENT_TYPING, { senderId: data.senderId });
      this.logger.log(`Emitted ${SOCKET_EVENT_TYPING} to recipient ${data.recipientId}`);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_STOP_TYPING)
  async handleTypingStop(@MessageBody() data: { senderId: string; recipientId: string }) {
    const socketId = this.presenceService.getSocketId(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit(SOCKET_EVENT_STOP_TYPING, { senderId: data.senderId });
      this.logger.log(`Emitted ${SOCKET_EVENT_STOP_TYPING} to recipient ${data.recipientId}`);
    }
  }
}
