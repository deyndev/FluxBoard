import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Layout, Loader2, Search, Bell, LogOut, User as UserIcon } from 'lucide-react';
import { getBoards, createBoard } from '../api/boards';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dropdown, DropdownItem } from '../components/ui/Dropdown';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: boards, isLoading } = useQuery({
    queryKey: ['boards'],
    queryFn: getBoards,
  });

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setIsCreating(false);
      setNewBoardTitle('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;
    createMutation.mutate(newBoardTitle);
  };

  const filteredBoards = boards?.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 pt-24 max-w-7xl mx-auto">
      {/* Glass Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg border border-primary/20">
            <Layout className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-secondary bg-clip-text text-transparent">FluxBoard</h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block w-64">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Search boards..."
              className="!py-1.5 !rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dropdown
            trigger={
              <button className="relative text-secondary hover:text-white transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full animate-pulse" />
              </button>
            }
          >
            <div className="px-4 py-2 border-b border-white/5 text-xs font-medium text-secondary uppercase tracking-wider">
              Notifications
            </div>
            <div className="px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors cursor-pointer">
              <span className="font-bold text-primary">System</span> Welcome to FluxBoard!
              <div className="text-[10px] text-secondary mt-1">Just now</div>
            </div>
            <div className="px-4 py-3 text-sm text-white/80 hover:bg-white/5 transition-colors cursor-pointer">
              <span className="font-bold text-primary">Tip</span> Try dragging cards!
              <div className="text-[10px] text-secondary mt-1">2 mins ago</div>
            </div>
          </Dropdown>

          <div className="h-8 w-[1px] bg-white/10" />

          <Dropdown
            trigger={
              <div className="flex items-center gap-3 cursor-pointer group">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">{user?.username}</p>
                  <p className="text-xs text-secondary">Pro Plan</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent p-[1px] group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-sm font-bold">
                    {user?.username[0].toUpperCase()}
                  </div>
                </div>
              </div>
            }
          >
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-medium text-white">{user?.email}</p>
            </div>
            <DropdownItem icon={<UserIcon />}>Profile</DropdownItem>
            <DropdownItem icon={<LogOut />} variant="danger" onClick={logout}>Sign Out</DropdownItem>
          </Dropdown>
        </div>
      </header>

      <div className="mb-10 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Workspaces</h2>
          <p className="text-secondary">Manage your projects and collaborate in real-time.</p>
        </div>
        <Button onClick={() => setIsCreating(true)} icon={<Plus className="w-4 h-4" />}>
          New Board
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Create Board Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative glass-card rounded-3xl p-6 flex flex-col items-center justify-center min-h-[220px] cursor-pointer hover:bg-white/5 border-dashed border-2 border-white/10 hover:border-primary/30"
          onClick={() => setIsCreating(true)}
        >
          <div className="p-4 bg-white/5 rounded-full mb-4 group-hover:scale-110 transition-transform group-hover:bg-primary/20 group-hover:text-primary">
            <Plus className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
          </div>
          <span className="font-medium text-secondary group-hover:text-white transition-colors">Create New Board</span>
        </motion.div>

        {/* Board List */}
        {filteredBoards?.map((board, index) => (
          <Link key={board.id} to={`/boards/${board.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -5 }}
              className="glass-card rounded-3xl p-6 h-[220px] flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[50px] -mr-10 -mt-10 group-hover:bg-primary/10 transition-all duration-500" />

              {board.ownerId !== user?.id && (
                <div className="absolute top-4 right-4 z-20 px-2 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-medium uppercase tracking-wider border border-primary/20">
                  Shared
                </div>
              )}

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{board.title}</h3>
                <p className="text-xs text-secondary mt-2">
                  Edited {new Date(board.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-secondary">
                    {user?.username[0].toUpperCase()}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-secondary">
                    +2
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-wider text-secondary border border-white/5">
                  Active
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass p-8 rounded-3xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-2">Create New Board</h2>
            <p className="text-secondary text-sm mb-6">Give your project a home.</p>
            <form onSubmit={handleCreate}>
              <div className="mb-6">
                <Input
                  label="Board Title"
                  autoFocus
                  placeholder="e.g., Marketing Campaign"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                <Button type="submit" loading={createMutation.isPending}>Create Board</Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
