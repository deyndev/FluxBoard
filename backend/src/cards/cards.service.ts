import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LexoRank } from 'lexorank';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { Card } from './entities/card.entity';
import { BoardColumn } from '../columns/entities/column.entity';
import { Board } from '../boards/entities/board.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card) private cardsRepo: Repository<Card>,
    @InjectRepository(BoardColumn) private columnsRepo: Repository<BoardColumn>,
    @InjectRepository(Board) private boardsRepo: Repository<Board>,
  ) { }

  async create(createCardDto: CreateCardDto, userId: string) {
    const column = await this.columnsRepo.findOne({
      where: { id: createCardDto.columnId },
      relations: ['board']
    });

    if (!column) throw new NotFoundException('Column not found');
    if (column.board.ownerId !== userId) throw new ForbiddenException('Access denied');

    const lastCard = await this.cardsRepo.findOne({
      where: { columnId: createCardDto.columnId },
      order: { rank: 'DESC' },
    });

    const rank = lastCard
      ? LexoRank.parse(lastCard.rank).genNext().toString()
      : LexoRank.middle().toString();

    const card = this.cardsRepo.create({
      ...createCardDto,
      rank,
    });
    return this.cardsRepo.save(card);
  }

  async update(id: string, updateCardDto: UpdateCardDto, userId: string) {
    const card = await this.findOne(id, userId);

    if (updateCardDto.columnId && updateCardDto.columnId !== card.columnId) {
      // Validate new column ownership
      const newColumn = await this.columnsRepo.findOne({
        where: { id: updateCardDto.columnId },
        relations: ['board']
      });
      if (!newColumn) throw new NotFoundException('Target column not found');
      if (newColumn.board.ownerId !== userId) throw new ForbiddenException('Target column access denied');
    }

    Object.assign(card, updateCardDto);
    // Clear the relation to ensure columnId takes precedence in TypeORM
    (card as any).column = undefined;

    return this.cardsRepo.save(card);
  }

  async remove(id: string, userId: string) {
    const card = await this.findOne(id, userId);
    return this.cardsRepo.remove(card);
  }

  async findOne(id: string, userId: string) {
    const card = await this.cardsRepo.findOne({
      where: { id },
      relations: ['column', 'column.board'],
    });

    if (!card) throw new NotFoundException(`Card #${id} not found`);
    if (card.column.board.ownerId !== userId) throw new ForbiddenException('Access denied');

    return card;
  }
}
