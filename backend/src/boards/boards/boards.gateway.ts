import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/ws-jwt.guard';
import { BoardPersistProcessor } from '../board-persist.processor';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL, 
      'http://localhost:5173', 
      'http://localhost:8080',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:8080'
    ],
    credentials: true,
  },
  namespace: 'boards',
})
@UseGuards(WsJwtGuard)
export class BoardsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private boardPersist: BoardPersistProcessor) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @MessageBody() boardId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(boardId);
    console.log(`Client ${client.id} joined board ${boardId}`);
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
