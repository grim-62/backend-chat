import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  // Map<userId, Set<socketIds>>
  private onlineUsers = new Map<string, Set<string>>();

  addUser(userId: string, socketId: string) {
    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }
    this.onlineUsers.get(userId)!.add(socketId);

    this.logger.debug(
      `Added socket ${socketId} for user ${userId} → total sockets: ${this.onlineUsers.get(userId)!.size}`,
    );
  }

  removeUser(userId: string, socketId: string) {
    if (!this.onlineUsers.has(userId)) return;

    const sockets = this.onlineUsers.get(userId)!;
    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      this.logger.debug(`Removed last socket for user ${userId} → user offline`);
    } else {
      this.logger.debug(
        `Removed socket ${socketId} for user ${userId} → remaining sockets: ${sockets.size}`,
      );
    }
  }

  getSocketIds(userId: string): string[] {
    return [...(this.onlineUsers.get(userId) || [])];
  }

  getOnlineUsers(): string[] {
    return [...this.onlineUsers.keys()];
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }
}
