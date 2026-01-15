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

export interface Board {
  id: string;
  title: string;
  columns: Column[];
  created_at: string;
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
