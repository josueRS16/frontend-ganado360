import http from './http';
import type { 
  Estado, 
  EstadoRequest, 
  EstadosFilters,
  ApiResponse,
  PaginatedResponse 
} from '../types/api';

export const estadosApi = {
  // GET /estados con filtros y paginación
  getAll: async (filters: EstadosFilters = {}): Promise<PaginatedResponse<Estado[]>> => {
    const response = await http.get('/estados', { params: filters });
    return response.data;
  },

  // GET /estados/:id
  getById: async (id: number): Promise<ApiResponse<Estado>> => {
    const response = await http.get(`/estados/${id}`);
    return response.data;
  },

  // POST /estados
  create: async (data: EstadoRequest): Promise<ApiResponse<Estado>> => {
    const response = await http.post('/estados', data);
    return response.data;
  },

  // PUT /estados/:id
  update: async (id: number, data: EstadoRequest): Promise<ApiResponse<Estado>> => {
    const response = await http.put(`/estados/${id}`, data);
    return response.data;
  },

  // DELETE /estados/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/estados/${id}`);
  },
};
