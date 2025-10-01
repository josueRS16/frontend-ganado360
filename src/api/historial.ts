import http from './http';
import type { 
  HistorialVeterinario, 
  HistorialVeterinarioRequest, 
  ApiResponse 
} from '../types/api';

export const historialApi = {
  // GET /historial con paginación
  getAll: async (filters: { page?: number; limit?: number } = {}): Promise<any> => {
    const response = await http.get('/historial', { params: filters });
    return response.data;
  },

  // GET /historial/:id
  getById: async (id: number): Promise<ApiResponse<HistorialVeterinario>> => {
    const response = await http.get(`/historial/${id}`);
    return response.data;
  },

  // POST /historial
  create: async (data: HistorialVeterinarioRequest): Promise<ApiResponse<HistorialVeterinario>> => {
    const response = await http.post('/historial', data);
    return response.data;
  },

  // PUT /historial/:id
  update: async (id: number, data: HistorialVeterinarioRequest): Promise<ApiResponse<HistorialVeterinario>> => {
    const response = await http.put(`/historial/${id}`, data);
    return response.data;
  },

  // DELETE /historial/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/historial/${id}`);
  },
};
