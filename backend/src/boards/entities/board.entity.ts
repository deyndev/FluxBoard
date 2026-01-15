import { Entity, PrimaryGeneratedColumn, Column as DbColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { BoardColumn } from '../../columns/entities/column.entity';
import { BoardMember } from './board-member.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @DbColumn()
  title: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  owner: User;

  @DbColumn()
  ownerId: string;

  @OneToMany(() => BoardColumn, (column) => column.board)
  columns: BoardColumn[];

  @OneToMany(() => BoardMember, (member) => member.board)
  members: BoardMember[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
