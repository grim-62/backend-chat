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
    this.logger.log(`User ${userId} connected`);

    this.server.emit('userOnline', { userId });
  }

  async handleDisconnect(client: Socket) {
    const userId = [...this.presenceService.getOnlineUsers()].find(
      (id) => this.presenceService.getSocketId(id) === client.id,
    );

    if (userId) {
      this.presenceService.removeUser(userId);
      this.logger.log(`User ${userId} disconnected`);
      this.server.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody()
    data: { senderId: string; recipientId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { senderId, recipientId, message } = data;
    this.logger.debug(`Message from ${senderId} to ${recipientId}: ${message}`);

    client.emit('messageSent', { senderId, recipientId, message });

    const recipientSocketId = this.presenceService.getSocketId(recipientId);
    if (recipientSocketId) {
      this.server.to(recipientSocketId).emit('receiveMessage', {
        senderId,
        message,
      });
    } else {
      this.logger.warn(`Recipient ${recipientId} is offline, storing message in DB later`);
    }
  }

  @SubscribeMessage('typingStart')
  async handleTypingStart(@MessageBody() data: { senderId: string; recipientId: string }) {
    const socketId = this.presenceService.getSocketId(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit('typingStart', { senderId: data.senderId });
    }
  }

  @SubscribeMessage('typingStop')
  async handleTypingStop(@MessageBody() data: { senderId: string; recipientId: string }) {
    const socketId = this.presenceService.getSocketId(data.recipientId);
    if (socketId) {
      this.server.to(socketId).emit('typingStop', { senderId: data.senderId });
    }
  }
}
