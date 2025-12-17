import axios from 'axios';
import type { AuthResponse, Ticket, TicketListResponse, TicketStats, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    return data;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

// Tickets
export const ticketsAPI = {
  getAll: async (params?: {
    status?: string;
    priority?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<TicketListResponse> => {
    const { data } = await api.get<TicketListResponse>('/api/tickets', { params });
    return data;
  },

  getById: async (id: string): Promise<Ticket> => {
    const { data } = await api.get<Ticket>(`/api/tickets/${id}`);
    return data;
  },

  getStats: async (): Promise<TicketStats> => {
    const { data} = await api.get<TicketStats>('/api/tickets/stats');
    return data;
  },

  updateStatus: async (id: string, status: string): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/api/tickets/${id}/status`, { status });
    return data;
  },

  updatePriority: async (id: string, priority: string): Promise<Ticket> => {
    const { data } = await api.patch<Ticket>(`/api/tickets/${id}/priority`, { priority });
    return data;
  },

  reply: async (id: string, body_text: string, body_html?: string) => {
    const { data } = await api.post(`/api/tickets/${id}/reply`, { body_text, body_html });
    return data;
  },
};
