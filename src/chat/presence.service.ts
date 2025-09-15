import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  // userId → socketId
  private onlineUsers = new Map<string, string>();

  addUser(userId: string, socketId: string) {
    this.onlineUsers.set(userId, socketId);
  }

  removeUser(userId: string) {
    this.onlineUsers.delete(userId);
  }

  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  getOnlineUsers(): string[] {
    return [...this.onlineUsers.keys()];
  }

  getSocketId(userId: string): string | undefined {
    return this.onlineUsers.get(userId);
  }
}
