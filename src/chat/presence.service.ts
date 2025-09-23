import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly logger = new Logger(PresenceService.name);

  // Map<userId, Set<socketIds>>
  private onlineUsers = new Map<string, Set<string>>();

  // Optional: Track last seen timestamps
  private lastSeen = new Map<string, Date>();

  /**
   * Add a socket for a user (on connect).
   */
  addUser(userId: string, socketId: string): void {
    if (!userId || !socketId) return;

    if (!this.onlineUsers.has(userId)) {
      this.onlineUsers.set(userId, new Set());
    }

    this.onlineUsers.get(userId)!.add(socketId);

    this.logger.debug(
      `User ${userId} connected with socket ${socketId}. Total sockets: ${this.onlineUsers.get(
        userId,
      )!.size}`,
    );
  }

  /**
   * Remove a specific socket for a user (on disconnect).
   */
  removeUser(userId: string, socketId: string): void {
    if (!this.onlineUsers.has(userId)) return;

    const sockets = this.onlineUsers.get(userId)!;
    sockets.delete(socketId);

    if (sockets.size === 0) {
      this.onlineUsers.delete(userId);
      this.lastSeen.set(userId, new Date());
      this.logger.debug(`User ${userId} went offline (last socket ${socketId} removed)`);
    } else {
      this.logger.debug(
        `Socket ${socketId} removed for user ${userId}. Remaining sockets: ${sockets.size}`,
      );
    }
  }

  /**
   * Remove by socketId only (no userId provided).
   * Useful when disconnect only provides socketId.
   */
  removeBySocketId(socketId: string): string | null {
    for (const [userId, sockets] of this.onlineUsers.entries()) {
      if (sockets.has(socketId)) {
        this.removeUser(userId, socketId);
        return userId;
      }
    }
    return null;
  }

  /**
   * Get all socketIds for a user.
   */
  getSocketIds(userId: string): string[] {
    return Array.from(this.onlineUsers.get(userId) ?? []);
  }

  /**
   * Get list of online userIds.
   */
  getOnlineUsers(): string[] {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Check if a user is online.
   */
  isOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  /**
   * Get last seen timestamp for a user (if offline).
   */
  getLastSeen(userId: string): Date | null {
    return this.lastSeen.get(userId) ?? null;
  }
}
