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
  SOCKET_EVENT_MESSAGE,
  SOCKET_EVENT_TYPING,
  SOCKET_EVENT_STOP_TYPING,
  SOCKET_EVENT_ONLINE_USERS,
} from './socket.constants';

@WebSocketGateway({
  cors: { origin: '*' }, // ⚠️ In production, restrict to your frontend domain
  transports: ['websocket'],
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly presenceService: PresenceService) {}

  async handleConnection(client: Socket) {
    try {
      const userId = client.handshake.query.userId as string;

      if (!userId) {
        this.logger.warn(`Socket ${client.id} tried to connect without userId`);
        client.disconnect(true);
        return;
      }

      this.presenceService.addUser(userId, client.id);
      this.logger.log(`User ${userId} connected with socket ${client.id}`);

      // Broadcast updated online users list
      this.server.emit(SOCKET_EVENT_ONLINE_USERS, {
        onlineUsers: this.presenceService.getOnlineUsers(),
      });
    } catch (err) {
      this.logger.error(`Error in handleConnection: ${err.message}`, err.stack);
      client.disconnect(true);
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      // Find the user who owns this socket
      const userId = [...this.presenceService.getOnlineUsers()].find((id) =>
        this.presenceService.getSocketIds(id).includes(client.id),
      );

      if (userId) {
        this.presenceService.removeUser(userId, client.id);
        this.logger.log(`User ${userId} disconnected socket ${client.id}`);

        // Broadcast updated online users list
        this.server.emit(SOCKET_EVENT_ONLINE_USERS, {
          onlineUsers: this.presenceService.getOnlineUsers(),
        });
      }
    } catch (err) {
      this.logger.error(`Error in handleDisconnect: ${err.message}`, err.stack);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_MESSAGE)
  async handleMessage(
    @MessageBody() data: { senderId: string; recipientId: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const { senderId, recipientId, message } = data;

      if (!senderId || !recipientId || !message) {
        this.logger.warn(`Invalid message payload: ${JSON.stringify(data)}`);
        return;
      }

      this.logger.debug(`Message from ${senderId} → ${recipientId}: ${message}`);

      // Send message back to sender (ack)
      client.emit(SOCKET_EVENT_MESSAGE, { senderId, message });

      // Send message to recipient (all sockets)
      const recipientSockets = this.presenceService.getSocketIds(recipientId);
      if (recipientSockets.length > 0) {
        recipientSockets.forEach((socketId) => {
          this.server.to(socketId).emit(SOCKET_EVENT_MESSAGE, { senderId, message });
        });
        this.logger.log(`Delivered message to ${recipientId} (${recipientSockets.length} sockets)`);
      } else {
        this.logger.warn(`Recipient ${recipientId} offline → store message in DB`);
      }
    } catch (err) {
      this.logger.error(`Error in handleMessage: ${err.message}`, err.stack);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_TYPING)
  async handleTyping(@MessageBody() data: { senderId: string; recipientId: string }) {
    try {
      const { senderId, recipientId } = data;

      const recipientSockets = this.presenceService.getSocketIds(recipientId);
      recipientSockets.forEach((socketId) => {
        this.server.to(socketId).emit(SOCKET_EVENT_TYPING, { senderId });
      });

      this.logger.debug(`User ${senderId} typing → ${recipientId}`);
    } catch (err) {
      this.logger.error(`Error in handleTyping: ${err.message}`, err.stack);
    }
  }

  @SubscribeMessage(SOCKET_EVENT_STOP_TYPING)
  async handleStopTyping(@MessageBody() data: { senderId: string; recipientId: string }) {
    try {
      const { senderId, recipientId } = data;

      const recipientSockets = this.presenceService.getSocketIds(recipientId);
      recipientSockets.forEach((socketId) => {
        this.server.to(socketId).emit(SOCKET_EVENT_STOP_TYPING, { senderId });
      });

      this.logger.debug(`User ${senderId} stopped typing → ${recipientId}`);
    } catch (err) {
      this.logger.error(`Error in handleStopTyping: ${err.message}`, err.stack);
    }
  }
}
