import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';
import { BoardsGateway } from './boards/boards.gateway';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { BoardPersistProcessor } from './board-persist.processor';
import { BoardMembersController } from './board-members.controller';
import { BoardMembersService } from './board-members.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, BoardMember]),
    AuthModule,
    RedisModule,
    UsersModule,
  ],
  controllers: [BoardsController, BoardMembersController],
  providers: [BoardsService, BoardMembersService, BoardsGateway, BoardPersistProcessor],
  exports: [BoardsService, BoardMembersService],
})
export class BoardsModule { }

