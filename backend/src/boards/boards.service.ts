import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { Board } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardsRepository: Repository<Board>,
  ) {}

  create(createBoardDto: CreateBoardDto, userId: string) {
    const board = this.boardsRepository.create({
      ...createBoardDto,
      ownerId: userId,
    });
    return this.boardsRepository.save(board);
  }

  findAll(userId: string) {
    return this.boardsRepository.find({
      where: { ownerId: userId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.boardsRepository.findOne({
      where: { id, ownerId: userId },
      relations: ['columns', 'columns.cards'],
    });

    if (!board) {
      throw new NotFoundException(`Board #${id} not found`);
    }

    // Sort columns by rank (if we had it, but for now by position or creation?)
    // Actually columns have rank (Lexorank). We should sort them.
    // Lexorank sorting is string comparison.
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
    const board = await this.findOne(id, userId); // Check existence & ownership
    Object.assign(board, updateBoardDto);
    return this.boardsRepository.save(board);
  }

  async remove(id: string, userId: string) {
    const board = await this.findOne(id, userId);
    return this.boardsRepository.remove(board);
  }
}
