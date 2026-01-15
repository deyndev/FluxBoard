import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  onModuleDestroy() {
    this.redis.disconnect();
  }

  // Board State Management
  async getBoardState(boardId: string) {
    const data = await this.redis.get(`board:${boardId}`);
    return data ? JSON.parse(data) : null;
  }

  async setBoardState(boardId: string, state: any) {
    // 1 hour TTL for active boards
    await this.redis.set(`board:${boardId}`, JSON.stringify(state), 'EX', 3600);
  }

  async invalidateBoard(boardId: string) {
    await this.redis.del(`board:${boardId}`);
  }
}
