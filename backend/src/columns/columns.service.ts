import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LexoRank } from 'lexorank';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { BoardColumn } from './entities/column.entity';
import { Board } from '../boards/entities/board.entity';

@Injectable()
export class ColumnsService {
  constructor(
    @InjectRepository(BoardColumn) private columnsRepo: Repository<BoardColumn>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
  ) {}

  async create(createColumnDto: CreateColumnDto, userId: string) {
    const board = await this.boardsRepo.findOne({ where: { id: createColumnDto.boardId } });
    if (!board) throw new NotFoundException('Board not found');
    if (board.ownerId !== userId) throw new ForbiddenException('Access denied');

    const lastColumn = await this.columnsRepo.findOne({
      where: { boardId: createColumnDto.boardId },
      order: { rank: 'DESC' },
    });

    const rank = lastColumn 
      ? LexoRank.parse(lastColumn.rank).genNext().toString()
      : LexoRank.middle().toString();

    const column = this.columnsRepo.create({
      ...createColumnDto,
      rank,
    });
    return this.columnsRepo.save(column);
  }

  async update(id: string, updateColumnDto: UpdateColumnDto, userId: string) {
    const column = await this.findOne(id, userId);
    Object.assign(column, updateColumnDto);
    return this.columnsRepo.save(column);
  }

  async remove(id: string, userId: string) {
    const column = await this.findOne(id, userId);
    return this.columnsRepo.remove(column);
  }

  async findOne(id: string, userId: string) {
    const column = await this.columnsRepo.findOne({
      where: { id },
      relations: ['board'],
    });

    if (!column) throw new NotFoundException(`Column #${id} not found`);
    if (column.board.ownerId !== userId) throw new ForbiddenException('Access denied');

    return column;
  }
}
