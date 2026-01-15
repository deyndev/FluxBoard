import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlignLeft, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { updateCard } from '../api/boards';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CardModalProps {
  card: { id: string; content: string; description?: string; due_date?: string };
  isOpen: boolean;
  onClose: () => void;
}

export function CardModal({ card, isOpen, onClose }: CardModalProps) {
  const [content, setContent] = useState(card.content);
  const [description, setDescription] = useState(card.description || '');
  const [dueDate, setDueDate] = useState(card.due_date || '');
  const queryClient = useQueryClient();
  const dateInputRef = useRef<HTMLInputElement>(null);

  const updateMutation = useMutation({
    mutationFn: (data: { content?: string; description?: string | null; due_date?: string | null }) => updateCard(card.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board'] });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      content,
      description: description || null,
      due_date: dueDate || null
    });
    onClose();
  };

  useEffect(() => {
    setContent(card.content);
    setDescription(card.description || '');
    setDueDate(card.due_date ? new Date(card.due_date).toISOString().split('T')[0] : '');
  }, [card]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-2xl bg-[#0f111a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start">
              <div className="flex-1 mr-4">
                <input
                  className="w-full bg-transparent text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary/50 rounded px-2 -ml-2 transition-all"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <p className="text-sm text-secondary mt-1">in list <span className="underline decoration-secondary/50">Column</span></p>
              </div>
              <button onClick={onClose} className="text-secondary hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex gap-8">
              {/* Main Content */}
              <div className="flex-1 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-3 text-white font-medium">
                    <AlignLeft className="w-5 h-5 text-secondary" />
                    Description
                  </div>
                  <textarea
                    className="w-full min-h-[150px] bg-white/[0.03] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all resize-y"
                    placeholder="Add a more detailed description..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="w-48 space-y-4">
                <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">Actions</div>

                <div className="relative group" onClick={() => dateInputRef.current?.showPicker()}>
                  <div className="w-full bg-white/5 text-white font-display font-medium px-5 py-2.5 rounded-xl hover:bg-white/10 border border-white/5 transition-all flex items-center justify-start gap-2 text-sm cursor-pointer pointer-events-none">
                    <Clock className="w-4 h-4" />
                    <span>{dueDate ? new Date(dueDate).toLocaleDateString() : 'Due Date'}</span>
                  </div>
                  <input
                    ref={dateInputRef}
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-end gap-3">
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
