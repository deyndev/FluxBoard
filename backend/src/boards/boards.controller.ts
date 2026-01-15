import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('boards')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 100, ttl: 60000 } })
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) { }

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @Req() req: any) {
    return this.boardsService.create(createBoardDto, req.user.userId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.boardsService.findAll(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.boardsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateBoardDto: UpdateBoardDto, @Req() req: any) {
    return this.boardsService.update(id, updateBoardDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.boardsService.remove(id, req.user.userId);
  }
}

