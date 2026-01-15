import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ParseUUIDPipe } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { BoardMembersService } from './board-members.service';
import { InviteMemberDto } from './dto/invite-member.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('boards/:boardId/members')
@UseGuards(JwtAuthGuard)
@Throttle({ default: { limit: 50, ttl: 60000 } })
export class BoardMembersController {
    constructor(private readonly boardMembersService: BoardMembersService) { }

    @Post()
    invite(
        @Param('boardId', ParseUUIDPipe) boardId: string,
        @Body() inviteMemberDto: InviteMemberDto,
        @Req() req: any,
    ) {
        return this.boardMembersService.inviteMember(boardId, inviteMemberDto.email, req.user.userId);
    }

    @Get()
    getMembers(
        @Param('boardId', ParseUUIDPipe) boardId: string,
        @Req() req: any,
    ) {
        return this.boardMembersService.getMembers(boardId, req.user.userId);
    }

    @Delete(':userId')
    removeMember(
        @Param('boardId', ParseUUIDPipe) boardId: string,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Req() req: any,
    ) {
        return this.boardMembersService.removeMember(boardId, userId, req.user.userId);
    }
}
