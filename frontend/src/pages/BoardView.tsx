import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult, DragStart } from '@hello-pangea/dnd';
import { LexoRank } from 'lexorank';
import { Plus, MoreHorizontal, Loader2, Lock, ChevronLeft, Layout, Share2, Settings, Trash2, Edit2, Check, AlignLeft, Clock } from 'lucide-react';
import { getBoard, createColumn, createCard, updateCard, updateColumn, deleteColumn, updateBoard, deleteBoard } from '../api/boards';
import type { Board, Card } from '../api/boards';
import { socket } from '../api/socket';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dropdown, DropdownItem } from '../components/ui/Dropdown';
import { motion, AnimatePresence } from 'framer-motion';
import { CardModal } from '../components/CardModal';
import { Modal } from '../components/ui/Modal';

interface CardContentProps {
  card: Card;
  isLocked: { userId: string, email: string } | undefined;
  onClick: () => void;
  provided: any;
  snapshot: any;
}

const CardContent = ({ card, isLocked, onClick, provided, snapshot }: CardContentProps) => {
  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={onClick}
      style={{
        ...provided.draggableProps.style,
        zIndex: snapshot.isDragging ? 9999 : undefined,
      }}
      className={`glass-card p-4 rounded-xl mb-3 relative group ${snapshot.isDragging ? 'shadow-2xl ring-1 ring-primary/50 rotate-1 bg-[#161b22]' : 'bg-[#161b22]/40 hover:bg-[#161b22]/60'
        } ${isLocked ? 'opacity-50 grayscale cursor-not-allowed border-dashed border-red-500/20' : 'cursor-grab active:cursor-grabbing'
        }`}
    >
      <p className="text-sm text-gray-200 leading-relaxed">{card.content}</p>

      <div className="flex flex-wrap gap-2 mt-2">
        {card.description && (
          <div className="flex items-center gap-1 text-[10px] text-secondary bg-white/5 px-1.5 py-0.5 rounded">
            <AlignLeft className="w-3 h-3" />
          </div>
        )}
        {card.due_date && (
          <div className="flex items-center gap-1 text-[10px] text-secondary bg-white/5 px-1.5 py-0.5 rounded">
            <Clock className="w-3 h-3" />
            <span>{new Date(card.due_date).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {isLocked && (
        <div className="absolute -top-2 -right-2 flex items-center gap-1 text-[10px] font-bold text-white bg-red-500 shadow-lg shadow-red-500/20 px-2 py-1 rounded-full z-10 animate-pulse">
          <Lock className="w-3 h-3" />
          <span>{isLocked.email.split('@')[0]}</span>
        </div>
      )}
    </div>
  );
};

export default function BoardView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [localBoard, setLocalBoard] = useState<Board | null>(null);
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');
  const [lockedCards, setLockedCards] = useState<Record<string, { userId: string, email: string }>>({});
  const [showToast, setShowToast] = useState(false);
  const [selectedCard, setSelectedCard] = useState<{ card: Card, columnId: string } | null>(null);

  // Modal states
  const [isRenameBoardOpen, setIsRenameBoardOpen] = useState(false);
  const [tempBoardTitle, setTempBoardTitle] = useState('');

  const [isDeleteBoardOpen, setIsDeleteBoardOpen] = useState(false);

  const [columnToDelete, setColumnToDelete] = useState<string | null>(null);

  const [addCardColumnId, setAddCardColumnId] = useState<string | null>(null);
  const [newCardContent, setNewCardContent] = useState('');

  const { data: board, isLoading } = useQuery({
    queryKey: ['board', id],
    queryFn: () => getBoard(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (board) setLocalBoard(board);
  }, [board]);

  useEffect(() => {
    if (!id) return;

    socket.connect();
    socket.emit('joinBoard', id);

    socket.on('cardMoved', (payload) => {
      setLocalBoard((prev) => {
        if (!prev) return null;

        const sourceCol = prev.columns.find(c => c.cards.some(card => card.id === payload.cardId));
        const destCol = prev.columns.find(c => c.id === payload.columnId);

        if (!sourceCol || !destCol) return prev;

        const sourceCards = Array.from(sourceCol.cards);
        const cardIndex = sourceCards.findIndex(c => c.id === payload.cardId);
        if (cardIndex === -1) return prev;

        const [movedCard] = sourceCards.splice(cardIndex, 1);
        movedCard.rank = payload.rank;

        const destCards = sourceCol.id === destCol.id ? sourceCards : Array.from(destCol.cards);

        destCards.push(movedCard);
        destCards.sort((a, b) => a.rank.localeCompare(b.rank));

        return {
          ...prev,
          columns: prev.columns.map(col => {
            if (col.id === sourceCol.id) return { ...col, cards: sourceCards };
            if (col.id === destCol.id) return { ...col, cards: destCards };
            return col;
          })
        };
      });
    });

    socket.on('columnMoved', (payload) => {
      setLocalBoard((prev) => {
        if (!prev) return null;
        const newCols = prev.columns.map(c =>
          c.id === payload.columnId ? { ...c, rank: payload.rank } : c
        );
        newCols.sort((a, b) => a.rank.localeCompare(b.rank));
        return { ...prev, columns: newCols };
      });
    });

    socket.on('cardLocked', (payload) => {
      setLockedCards(prev => ({ ...prev, [payload.cardId]: { userId: payload.userId, email: payload.email } }));
    });

    socket.on('cardUnlocked', (payload) => {
      setLockedCards(prev => {
        const next = { ...prev };
        delete next[payload.cardId];
        return next;
      });
    });

    return () => {
      socket.emit('leaveBoard', id);
      socket.off('cardMoved');
      socket.off('columnMoved');
      socket.off('cardLocked');
      socket.off('cardUnlocked');
      socket.disconnect();
    };
  }, [id]);

  const addColumnMutation = useMutation({
    mutationFn: (title: string) => createColumn(id!, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', id] }),
  });

  const addCardMutation = useMutation({
    mutationFn: ({ colId, content }: { colId: string; content: string }) => createCard(colId, content),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', id] }),
  });

  const deleteColumnMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['board', id] }),
  });

  const updateBoardMutation = useMutation({
    mutationFn: (title: string) => updateBoard(id!, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', id] });
      setIsRenameBoardOpen(false);
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: () => deleteBoard(id!),
    onSuccess: () => navigate('/dashboard'),
  });

  const moveCardMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; rank: string; columnId: string }) => updateCard(id, data),
    onError: (error) => {
      console.error('Failed to move card:', error);
      // Refetch to restore correct state on error
      queryClient.invalidateQueries({ queryKey: ['board', id] });
    },
  });

  const moveColumnMutation = useMutation({
    mutationFn: ({ id, rank }: { id: string; rank: string }) => updateColumn(id, { rank }),
    onError: (error) => {
      console.error('Failed to move column:', error);
      queryClient.invalidateQueries({ queryKey: ['board', id] });
    },
  });

  const onDragStart = (start: DragStart) => {
    if (start.type === 'CARD') {
      socket.emit('cardDragStart', { boardId: id, cardId: start.draggableId });
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (type === 'CARD') {
      socket.emit('cardDragEnd', { boardId: id, cardId: draggableId });
    }

    if (!destination || !localBoard) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    if (type === 'COLUMN') {
      const newColumns = Array.from(localBoard.columns);
      const [moved] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, moved);

      setLocalBoard({ ...localBoard, columns: newColumns });

      const prev = newColumns[destination.index - 1];
      const next = newColumns[destination.index + 1];
      let newRank = LexoRank.middle().toString();

      if (prev && next) newRank = LexoRank.parse(prev.rank).between(LexoRank.parse(next.rank)).toString();
      else if (prev) newRank = LexoRank.parse(prev.rank).genNext().toString();
      else if (next) newRank = LexoRank.parse(next.rank).genPrev().toString();

      const payload = { id: draggableId, rank: newRank };
      moveColumnMutation.mutate(payload);
      socket.emit('columnMove', { boardId: id, columnId: draggableId, rank: newRank });
      return;
    }

    const sourceCol = localBoard.columns.find(c => c.id === source.droppableId);
    const destCol = localBoard.columns.find(c => c.id === destination.droppableId);

    if (!sourceCol || !destCol) return;

    const sourceCards = Array.from(sourceCol.cards || []);
    const [movedCard] = sourceCards.splice(source.index, 1);

    const destCards = source.droppableId === destination.droppableId
      ? sourceCards
      : Array.from(destCol.cards || []);

    destCards.splice(destination.index, 0, movedCard);

    const newColumns = localBoard.columns.map(col => {
      if (col.id === source.droppableId) return { ...col, cards: sourceCards };
      if (col.id === destination.droppableId) return { ...col, cards: destCards };
      return col;
    });

    setLocalBoard({ ...localBoard, columns: newColumns });

    const prev = destCards[destination.index - 1];
    const next = destCards[destination.index + 1];
    let newRank = LexoRank.middle().toString();

    if (prev && next) newRank = LexoRank.parse(prev.rank).between(LexoRank.parse(next.rank)).toString();
    else if (prev) newRank = LexoRank.parse(prev.rank).genNext().toString();
    else if (next) newRank = LexoRank.parse(next.rank).genPrev().toString();

    const payload = {
      id: draggableId,
      rank: newRank,
      columnId: destination.droppableId
    };
    moveCardMutation.mutate(payload);
    socket.emit('cardMove', { boardId: id, cardId: draggableId, ...payload });
  };

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    addColumnMutation.mutate(newColTitle);
    setNewColTitle('');
    setIsAddingCol(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  if (isLoading || !localBoard) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden relative">
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-surface border border-primary/20 text-primary px-4 py-2 rounded-xl shadow-xl z-[100] flex items-center gap-2"
          >
            <Check className="w-4 h-4" /> Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 py-4 glass-panel flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 hover:bg-white/5 rounded-full transition-colors text-secondary hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
              <Layout className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">{localBoard.title}</h1>
              <p className="text-[10px] text-secondary uppercase tracking-widest font-medium">Board View</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-secondary">
              A
            </div>
            <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center text-xs text-secondary">
              +
            </div>
          </div>

          <Button variant="secondary" size="sm" icon={<Share2 className="w-4 h-4" />} onClick={handleShare}>Share</Button>

          <Dropdown trigger={
            <Button variant="secondary" size="sm" icon={<Settings className="w-4 h-4" />}>Settings</Button>
          }>
            <DropdownItem
              icon={<Edit2 />}
              onClick={() => {
                setTempBoardTitle(localBoard.title);
                setIsRenameBoardOpen(true);
              }}
            >
              Rename Board
            </DropdownItem>
            <DropdownItem
              icon={<Trash2 />}
              variant="danger"
              onClick={() => setIsDeleteBoardOpen(true)}
            >
              Delete Board
            </DropdownItem>
          </Dropdown>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd} onDragStart={onDragStart}>
        <Droppable droppableId="board" direction="horizontal" type="COLUMN">
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="flex-1 overflow-x-auto p-8 flex gap-6 items-start"
            >
              {localBoard.columns.map((column, index) => (
                <Draggable key={column.id} draggableId={column.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className="w-80 flex-shrink-0 glass rounded-2xl flex flex-col max-h-full border border-white/5 shadow-2xl"
                    >
                      <div
                        {...provided.dragHandleProps}
                        className="p-4 flex justify-between items-center cursor-grab active:cursor-grabbing group"
                      >
                        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary/50" />
                          {column.title}
                          <span className="text-xs text-secondary font-normal ml-1 bg-white/5 px-2 py-0.5 rounded-full">{column.cards?.length || 0}</span>
                        </h3>
                        <Dropdown
                          trigger={<MoreHorizontal className="w-4 h-4 text-secondary hover:text-white transition-colors cursor-pointer" />}
                        >
                          <DropdownItem
                            icon={<Trash2 />}
                            variant="danger"
                            onClick={() => setColumnToDelete(column.id)}
                          >
                            Delete Column
                          </DropdownItem>
                        </Dropdown>
                      </div>

                      <Droppable
                        droppableId={column.id}
                        type="CARD"
                        renderClone={(provided, snapshot, rubric) => {
                          const card = column.cards?.find(c => c.id === rubric.draggableId);
                          if (!card) return <div />;
                          const isLocked = lockedCards[card.id];
                          return createPortal(
                            <CardContent
                              card={card}
                              isLocked={isLocked}
                              onClick={() => setSelectedCard({ card, columnId: column.id })}
                              provided={provided}
                              snapshot={snapshot}
                            />,
                            document.body
                          );
                        }}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className={`p-3 flex-1 overflow-y-auto min-h-[100px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''
                              }`}
                          >
                            {column.cards?.map((card, index) => {
                              const isLocked = lockedCards[card.id];
                              return (
                                <Draggable
                                  key={card.id}
                                  draggableId={card.id}
                                  index={index}
                                  isDragDisabled={!!isLocked}
                                >
                                  {(provided, snapshot) => (
                                    <CardContent
                                      card={card}
                                      isLocked={isLocked}
                                      onClick={() => setSelectedCard({ card, columnId: column.id })}
                                      provided={provided}
                                      snapshot={snapshot}
                                    />
                                  )}
                                </Draggable>
                              );
                            })}
                            {provided.placeholder}

                            <button
                              onClick={() => {
                                setAddCardColumnId(column.id);
                                setNewCardContent('');
                              }}
                              className="w-full py-2.5 mt-2 flex items-center justify-center gap-2 text-secondary hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm font-medium border border-transparent hover:border-white/5 group"
                            >
                              <div className="p-1 bg-white/5 rounded group-hover:bg-white/10 transition-colors">
                                <Plus className="w-3 h-3" />
                              </div>
                              Add Card
                            </button>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              <div className="w-80 flex-shrink-0">
                {isAddingCol ? (
                  <form onSubmit={handleAddColumn} className="glass p-4 rounded-2xl border border-white/5">
                    <Input
                      autoFocus
                      placeholder="Column Title"
                      value={newColTitle}
                      onChange={e => setNewColTitle(e.target.value)}
                      className="mb-3"
                    />
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => setIsAddingCol(false)} type="button">Cancel</Button>
                      <Button size="sm" type="submit">Add Section</Button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setIsAddingCol(true)}
                    className="w-full py-4 glass-card border-dashed border-2 border-white/10 rounded-2xl flex items-center justify-center gap-2 text-secondary hover:text-white hover:border-white/20 transition-all group"
                  >
                    <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                      <Plus className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Add Section</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {selectedCard && (
        <CardModal
          card={selectedCard.card}
          isOpen={!!selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}

      {/* Rename Board Modal */}
      <Modal
        isOpen={isRenameBoardOpen}
        onClose={() => setIsRenameBoardOpen(false)}
        title="Rename Board"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (tempBoardTitle.trim() && tempBoardTitle !== localBoard.title) {
              updateBoardMutation.mutate(tempBoardTitle);
            } else {
              setIsRenameBoardOpen(false);
            }
          }}
        >
          <Input
            autoFocus
            value={tempBoardTitle}
            onChange={(e) => setTempBoardTitle(e.target.value)}
            placeholder="Board Title"
            className="mb-6"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsRenameBoardOpen(false)}>Cancel</Button>
            <Button type="submit" loading={updateBoardMutation.isPending}>Save</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Board Modal */}
      <Modal
        isOpen={isDeleteBoardOpen}
        onClose={() => setIsDeleteBoardOpen(false)}
        title="Delete Board"
        description="Are you sure you want to delete this board? This action cannot be undone."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setIsDeleteBoardOpen(false)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => deleteBoardMutation.mutate()}
            loading={deleteBoardMutation.isPending}
          >
            Delete Board
          </Button>
        </div>
      </Modal>

      {/* Delete Column Modal */}
      <Modal
        isOpen={!!columnToDelete}
        onClose={() => setColumnToDelete(null)}
        title="Delete Section"
        description="Are you sure you want to delete this section? All cards in it will be lost."
      >
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setColumnToDelete(null)}>Cancel</Button>
          <Button
            variant="danger"
            onClick={() => {
              if (columnToDelete) {
                deleteColumnMutation.mutate(columnToDelete);
                setColumnToDelete(null);
              }
            }}
            loading={deleteColumnMutation.isPending}
          >
            Delete Section
          </Button>
        </div>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        isOpen={!!addCardColumnId}
        onClose={() => setAddCardColumnId(null)}
        title="Add Card"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newCardContent.trim() && addCardColumnId) {
              addCardMutation.mutate({ colId: addCardColumnId, content: newCardContent });
              setNewCardContent('');
              setAddCardColumnId(null);
            }
          }}
        >
          <Input
            autoFocus
            value={newCardContent}
            onChange={(e) => setNewCardContent(e.target.value)}
            placeholder="What needs to be done?"
            className="mb-6"
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setAddCardColumnId(null)}>Cancel</Button>
            <Button type="submit" loading={addCardMutation.isPending}>Add Card</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
