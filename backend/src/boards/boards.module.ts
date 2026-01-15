import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardsGateway } from './boards/boards.gateway';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { BoardPersistProcessor } from './board-persist.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Board]), AuthModule, RedisModule],
  controllers: [BoardsController],
  providers: [BoardsService, BoardsGateway, BoardPersistProcessor],
  exports: [BoardsService],
})
export class BoardsModule {}
