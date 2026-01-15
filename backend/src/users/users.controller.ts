import { Controller, Get, Param, Query, UseGuards, Req, ParseUUIDPipe, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('search')
  search(@Query('email') email: string) {
    if (!email || email.length < 2) {
      return [];
    }
    return this.usersService.searchByEmail(email);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    // Only allow fetching own user data
    if (id !== req.user.userId) {
      throw new ForbiddenException('Access denied');
    }
    return this.usersService.findOne(id);
  }
}


