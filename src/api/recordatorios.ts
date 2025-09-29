import http from './http';
import { buildParams } from '../utils/params';
import type { 
  Recordatorio, 
  RecordatorioRequest, 
  RecordatoriosFilters, 
  ApiResponse, 
  PaginatedResponse
} from '../types/api';

export const recordatoriosApi = {
  getAll: (filters: RecordatoriosFilters = {}): Promise<PaginatedResponse<Recordatorio>> => {
    const params = buildParams(filters);
    return http.get('/recordatorios', { params }).then(res => res.data);
  },
  getById: (id: number): Promise<ApiResponse<Recordatorio>> => {
    return http.get(`/recordatorios/${id}`).then(res => res.data);
  },
  create: (data: RecordatorioRequest): Promise<ApiResponse<Recordatorio>> => {
    return http.post('/recordatorios', data).then(res => res.data);
  },
  update: (id: number, data: RecordatorioRequest): Promise<ApiResponse<Recordatorio>> => {
    return http.put(`/recordatorios/${id}`, data).then(res => res.data);
  },
  delete: (id: number): Promise<void> => {
    return http.delete(`/recordatorios/${id}`).then(() => {});
  },
};
