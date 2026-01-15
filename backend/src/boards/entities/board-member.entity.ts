import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Board } from './board.entity';
import { User } from '../../users/entities/user.entity';

@Entity('board_members')
export class BoardMember {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Board, (board) => board.members, { onDelete: 'CASCADE' })
    board: Board;

    @Column()
    boardId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column({ default: 'member' })
    role: string; // 'owner' | 'member'

    @CreateDateColumn()
    joined_at: Date;
}
