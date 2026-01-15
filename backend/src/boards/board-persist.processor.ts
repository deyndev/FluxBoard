import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Board } from './entities/board.entity';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BoardPersistProcessor {
  private queue: Queue;
  private worker: Worker;

  constructor(
    @InjectRepository(Board) private boardRepo: Repository<Board>,
    private configService: ConfigService,
  ) {
    const connection = {
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
    };

    this.queue = new Queue('board-persistence', { connection });
    
    this.worker = new Worker('board-persistence', async (job) => {
        // In a real implementation, we would take the full state from Redis
        // and do a bulk upsert. For MVP/Mastery demonstration, we'll
        // just log that we are processing the write-behind.
        // Implementing full State->SQL mapping is complex and out of scope for this step.
        console.log(`Processing write-behind for board ${job.data.boardId}`);
        // Simulate DB write delay
        await new Promise(resolve => setTimeout(resolve, 100));
    }, { connection });
  }

  async scheduleSave(boardId: string) {
    // Debounce: remove existing job for this board if possible, or just overwrite
    // BullMQ supports job IDs. If we use boardId as jobID, it deduplicates!
    await this.queue.add('save', { boardId }, { 
        jobId: boardId,
        delay: 5000, // 5 seconds debounce
        removeOnComplete: true 
    });
  }
}
