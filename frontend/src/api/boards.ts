import api from './axios';

export interface Card {
  id: string;
  content: string;
  description?: string;
  due_date?: string;
  rank: string;
  columnId: string;
}

export interface Column {
  id: string;
  title: string;
  rank: string;
  cards: Card[];
}

export interface BoardMember {
  id: string;
  userId: string;
  role: 'owner' | 'member';
  joined_at: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

export interface Board {
  id: string;
  title: string;
  ownerId: string;
  columns: Column[];
  created_at: string;
}

export interface UserSearchResult {
  id: string;
  email: string;
  username: string;
}

export const getBoards = async () => {
  const res = await api.get<Board[]>('/boards');
  return res.data;
};

export const getBoard = async (id: string) => {
  const res = await api.get<Board>(`/boards/${id}`);
  return res.data;
};

export const createBoard = async (title: string) => {
  const res = await api.post<Board>('/boards', { title });
  return res.data;
};

export const updateBoard = async (id: string, data: { title: string }) => {
  const res = await api.patch<Board>(`/boards/${id}`, data);
  return res.data;
};

export const deleteBoard = async (id: string) => {
  const res = await api.delete(`/boards/${id}`);
  return res.data;
};

export const createColumn = async (boardId: string, title: string) => {
  const res = await api.post<Column>('/columns', { boardId, title });
  return res.data;
};

export const createCard = async (columnId: string, content: string) => {
  const res = await api.post<Card>('/cards', { columnId, content });
  return res.data;
};

export const updateColumn = async (id: string, data: { rank?: string; title?: string }) => {
  const res = await api.patch<Column>(`/columns/${id}`, data);
  return res.data;
};

export const updateCard = async (id: string, data: { rank?: string; content?: string; description?: string | null; due_date?: string | null; columnId?: string }) => {
  const res = await api.patch<Card>(`/cards/${id}`, data);
  return res.data;
};

export const deleteColumn = async (id: string) => {
  const res = await api.delete(`/columns/${id}`);
  return res.data;
};

// Board members API
export const getBoardMembers = async (boardId: string) => {
  const res = await api.get<BoardMember[]>(`/boards/${boardId}/members`);
  return res.data;
};

export const inviteBoardMember = async (boardId: string, email: string) => {
  const res = await api.post<BoardMember>(`/boards/${boardId}/members`, { email });
  return res.data;
};

export const removeBoardMember = async (boardId: string, userId: string) => {
  await api.delete(`/boards/${boardId}/members/${userId}`);
};

// User search
export const searchUsers = async (email: string) => {
  const res = await api.get<UserSearchResult[]>(`/users/search?email=${encodeURIComponent(email)}`);
  return res.data;
};

