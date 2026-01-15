import { Entity, PrimaryGeneratedColumn, Column as DbColumn, CreateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Card } from '../../cards/entities/card.entity';

@Entity('columns')
export class BoardColumn {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbColumn()
  title: string;

  @DbColumn()
  rank: string;

  @ManyToOne(() => Board, (board) => board.columns, { onDelete: 'CASCADE' })
  board: Board;

  @DbColumn()
  boardId: string;

  @OneToMany(() => Card, (card) => card.column)
  cards: Card[];

  @CreateDateColumn()
  created_at: Date;
}
