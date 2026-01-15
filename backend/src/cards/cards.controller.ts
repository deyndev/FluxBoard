import { Controller, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CardsService } from './cards.service';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cards')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 100, ttl: 60000 } })
export class CardsController {
  constructor(private readonly cardsService: CardsService) { }

  @Post()
  create(@Body() createCardDto: CreateCardDto, @Req() req: any) {
    return this.cardsService.create(createCardDto, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateCardDto: UpdateCardDto, @Req() req: any) {
    return this.cardsService.update(id, updateCardDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.cardsService.remove(id, req.user.userId);
  }
}

