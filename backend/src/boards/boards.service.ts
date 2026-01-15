import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';
import { BoardMember } from './entities/board-member.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
    @InjectRepository(BoardMember)
    private boardMembersRepository: Repository<BoardMember>,
  ) { }

  create(createBoardDto: CreateBoardDto, userId: string) {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      ownerId: userId,
    });
    return this.boardsRepository.save(board);
  }

  async findAll(userId: string) {
    // Get boards user owns or is a member of
    const boards = await this.boardsRepository
      .createQueryBuilder('board')
      .leftJoin('board.members', 'member')
      .where('board.ownerId = :userId', { userId })
      .orWhere('member.userId = :userId', { userId })
      .orderBy('board.created_at', 'DESC')
      .getMany();

    return boards;
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardsRepository.findOne({
      where: { id },
      relations: ['columns', 'columns.cards'],
    });

    if (!board) {
      throw new NotFoundException(`Board #${id} not found`);
    }

    // Check if user is owner or member
    const isOwner = board.ownerId === userId;
    const isMember = await this.boardMembersRepository.findOne({
      where: { boardId: id, userId },
    });

    if (!isOwner && !isMember) {
      throw new NotFoundException(`Board #${id} not found`);
    }

    // Sort columns by rank
    board.columns.sort((a, b) => a.rank.localeCompare(b.rank));

    // Sort cards in columns
    board.columns.forEach(col => {
      if (col.cards) {
        col.cards.sort((a, b) => a.rank.localeCompare(b.rank));
      }
    });

    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    const board = await this.findOne(id, userId);
    Object.assign(board, updateBoardDto);
    return this.boardsRepository.save(board);
  }

  async remove(id: string, userId: string) {
    const board = await this.boardsRepository.findOne({ where: { id } });

    if (!board) {
      throw new NotFoundException(`Board #${id} not found`);
    }

    // Only owner can delete
    if (board.ownerId !== userId) {
      throw new ForbiddenException('Only the board owner can delete this board');
    }

    return this.boardsRepository.remove(board);
  }

  async isOwner(boardId: string, userId: string): Promise<boolean> {
    const board = await this.boardsRepository.findOne({ where: { id: boardId } });
    return board?.ownerId === userId;
  }
}

