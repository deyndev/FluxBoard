import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards, Logger } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';
import { BoardPersistProcessor } from '../board-persist.processor';
import { BoardsService } from '../boards.service';

const wsOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:8080', 'http://127.0.0.1:5173', 'http://127.0.0.1:8080'];

@WebSocketGateway({
  cors: {
    origin: wsOrigins,
    credentials: true,
  },
  namespace: 'boards',
})
@UseGuards(WsJwtGuard)
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(BoardsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private boardPersist: BoardPersistProcessor,
    private boardsService: BoardsService,
  ) { }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  async handleJoinBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.user?.sub;
    if (!userId) {
      throw new WsException('Unauthorized');
    }

    // Verify board ownership
    try {
      await this.boardsService.findOne(boardId, userId);
    } catch {
      throw new WsException('Board not found or access denied');
    }

    client.join(boardId);
    this.logger.debug(`Client ${client.id} joined board ${boardId}`);
    return { event: 'joined', boardId };
  }

  @SubscribeMessage('leaveBoard')
  handleLeaveBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(boardId);
    return { event: 'left', boardId };
  }

  @SubscribeMessage('cardMove')
  handleCardMove(
    @MessageBody() payload: { boardId: string; cardId: string; rank: string; columnId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.boardId).emit('cardMoved', payload);
    this.boardPersist.scheduleSave(payload.boardId);
  }

  @SubscribeMessage('columnMove')
  handleColumnMove(
    @MessageBody() payload: { boardId: string; columnId: string; rank: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.boardId).emit('columnMoved', payload);
    this.boardPersist.scheduleSave(payload.boardId);
  }

  @SubscribeMessage('cardDragStart')
  handleCardDragStart(
    @MessageBody() payload: { boardId: string; cardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = client.data.user;
    client.to(payload.boardId).emit('cardLocked', {
      cardId: payload.cardId,
      userId: user.sub,
      email: user.email
    });
  }

  @SubscribeMessage('cardDragEnd')
  handleCardDragEnd(
    @MessageBody() payload: { boardId: string; cardId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.to(payload.boardId).emit('cardUnlocked', { cardId: payload.cardId });
  }
}

