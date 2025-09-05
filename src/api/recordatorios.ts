import http from './http';
import { buildParams } from '../utils/params';
import type { 
  Recordatorio, 
  RecordatorioRequest, 
  RecordatoriosFilters, 
  ApiResponse 
} from '../types/api';

export const recordatoriosApi = {
  // GET /recordatorios con filtros opcionales
  getAll: async (filters: RecordatoriosFilters = {}): Promise<ApiResponse<Recordatorio[]>> => {
    const params = buildParams(filters);
    const response = await http.get('/recordatorios', { params });
    return response.data;
  },

  // GET /recordatorios/:id
  getById: async (id: number): Promise<ApiResponse<Recordatorio>> => {
    const response = await http.get(`/recordatorios/${id}`);
    return response.data;
  },

  // POST /recordatorios
  create: async (data: RecordatorioRequest): Promise<ApiResponse<Recordatorio>> => {
    const response = await http.post('/recordatorios', data);
    return response.data;
  },

  // PUT /recordatorios/:id
  update: async (id: number, data: RecordatorioRequest): Promise<ApiResponse<Recordatorio>> => {
    const response = await http.put(`/recordatorios/${id}`, data);
    return response.data;
  },

  // DELETE /recordatorios/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/recordatorios/${id}`);
  },
};
