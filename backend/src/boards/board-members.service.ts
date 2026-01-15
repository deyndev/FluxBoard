import { Injectable, NotFoundException, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BoardMember } from './entities/board-member.entity';
import { Board } from './entities/board.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class BoardMembersService {
    constructor(
        @InjectRepository(BoardMember)
        private boardMembersRepository: Repository<BoardMember>,
        @InjectRepository(Board)
        private boardsRepository: Repository<Board>,
        private usersService: UsersService,
    ) { }

    async inviteMember(boardId: string, email: string, requestingUserId: string) {
        const board = await this.boardsRepository.findOne({ where: { id: boardId } });
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        if (board.ownerId !== requestingUserId) {
            throw new ForbiddenException('Only the board owner can invite members');
        }

        const userToInvite = await this.usersService.findByEmail(email);
        if (!userToInvite) {
            throw new NotFoundException('No user found with that email address');
        }

        if (userToInvite.id === board.ownerId) {
            throw new BadRequestException('Cannot invite the board owner as a member');
        }

        const existingMember = await this.boardMembersRepository.findOne({
            where: { boardId, userId: userToInvite.id },
        });
        if (existingMember) {
            throw new ConflictException('User is already a member of this board');
        }

        const member = this.boardMembersRepository.create({
            boardId,
            userId: userToInvite.id,
            role: 'member',
        });

        const saved = await this.boardMembersRepository.save(member);

        return {
            ...saved,
            user: {
                id: userToInvite.id,
                email: userToInvite.email,
                username: userToInvite.username,
            },
        };
    }

    async getMembers(boardId: string, requestingUserId: string) {
        const board = await this.boardsRepository.findOne({
            where: { id: boardId },
            relations: ['owner'],
        });
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        const hasAccess =
            board.ownerId === requestingUserId ||
            (await this.boardMembersRepository.findOne({
                where: { boardId, userId: requestingUserId },
            }));

        if (!hasAccess) {
            throw new ForbiddenException('Access denied');
        }

        const members = await this.boardMembersRepository.find({
            where: { boardId },
            relations: ['user'],
        });

        const ownerMember = {
            id: 'owner',
            userId: board.ownerId,
            boardId,
            role: 'owner',
            joined_at: board.created_at,
            user: {
                id: board.owner.id,
                email: board.owner.email,
                username: board.owner.username,
            },
        };

        const membersList = members.map((m) => ({
            id: m.id,
            userId: m.userId,
            boardId: m.boardId,
            role: m.role,
            joined_at: m.joined_at,
            user: {
                id: m.user.id,
                email: m.user.email,
                username: m.user.username,
            },
        }));

        return [ownerMember, ...membersList];
    }

    async removeMember(boardId: string, userIdToRemove: string, requestingUserId: string) {
        const board = await this.boardsRepository.findOne({ where: { id: boardId } });
        if (!board) {
            throw new NotFoundException('Board not found');
        }

        if (board.ownerId !== requestingUserId) {
            throw new ForbiddenException('Only the board owner can remove members');
        }

        if (userIdToRemove === board.ownerId) {
            throw new BadRequestException('Cannot remove the board owner');
        }

        const member = await this.boardMembersRepository.findOne({
            where: { boardId, userId: userIdToRemove },
        });

        if (!member) {
            throw new NotFoundException('Member not found');
        }

        await this.boardMembersRepository.remove(member);
        return { success: true };
    }

    async isMember(boardId: string, userId: string): Promise<boolean> {
        const member = await this.boardMembersRepository.findOne({
            where: { boardId, userId },
        });
        return !!member;
    }
}
