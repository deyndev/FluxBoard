import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Loader2, X, Crown, User as UserIcon, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { getBoardMembers, inviteBoardMember, removeBoardMember } from '../api/boards';
import type { BoardMember } from '../api/boards';
import { useAuth } from '../context/AuthContext';

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    boardId: string;
    ownerId: string;
}

export function ShareModal({ isOpen, onClose, boardId, ownerId }: ShareModalProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const isOwner = user?.id === ownerId;

    const { data: members, isLoading } = useQuery({
        queryKey: ['boardMembers', boardId],
        queryFn: () => getBoardMembers(boardId),
        enabled: isOpen,
    });

    const inviteMutation = useMutation({
        mutationFn: (inviteEmail: string) => inviteBoardMember(boardId, inviteEmail),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] });
            setEmail('');
            setError('');
        },
        onError: (err: any) => {
            const message = err.response?.data?.message || 'Failed to invite user';
            setError(message);
        },
    });

    const removeMutation = useMutation({
        mutationFn: (userId: string) => removeBoardMember(boardId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boardMembers', boardId] });
        },
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setError('');
        inviteMutation.mutate(email.trim());
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Share Board"
            description="Invite people to collaborate on this board"
            maxWidth="md"
        >
            {isOwner && (
                <form onSubmit={handleInvite} className="mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Input
                                icon={<Mail className="w-4 h-4" />}
                                placeholder="Enter email address..."
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        <Button type="submit" loading={inviteMutation.isPending}>
                            Invite
                        </Button>
                    </div>
                    {error && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}
                </form>
            )}

            <div className="border-t border-white/5 pt-4">
                <h3 className="text-sm font-medium text-secondary mb-3">
                    Members ({members?.length || 0})
                </h3>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {members?.map((member: BoardMember) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${member.role === 'owner'
                                            ? 'bg-gradient-to-br from-primary to-accent'
                                            : 'bg-surface border border-white/10'
                                        }`}>
                                        {member.user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{member.user.username}</p>
                                        <p className="text-xs text-secondary">{member.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {member.role === 'owner' ? (
                                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                                            <Crown className="w-3 h-3" />
                                            Owner
                                        </span>
                                    ) : (
                                        <>
                                            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-secondary text-xs font-medium">
                                                <UserIcon className="w-3 h-3" />
                                                Member
                                            </span>
                                            {isOwner && (
                                                <button
                                                    onClick={() => removeMutation.mutate(member.userId)}
                                                    disabled={removeMutation.isPending}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-secondary hover:text-red-400 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {!isOwner && (
                <p className="mt-4 text-xs text-secondary text-center">
                    Only the board owner can invite or remove members.
                </p>
            )}
        </Modal>
    );
}
