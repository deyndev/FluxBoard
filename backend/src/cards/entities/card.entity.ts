import { Entity, PrimaryGeneratedColumn, Column as DbColumn, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { BoardColumn } from '../../columns/entities/column.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbColumn()
  content: string;

  @DbColumn({ nullable: true })
  description: string;

  @DbColumn()
  rank: string;

  @ManyToOne(() => BoardColumn, (column) => column.cards, { onDelete: 'CASCADE' })
  column: BoardColumn;

  @DbColumn()
  columnId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
