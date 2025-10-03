import http from './http';
import { buildParams } from '../utils/params';
import type { 
  Venta, 
  VentaRequest, 
  VentasFilters, 
  ApiResponse 
} from '../types/api';

export const ventasApi = {
  // GET /ventas con filtros opcionales
  getAll: async (filters: VentasFilters = {}): Promise<ApiResponse<Venta[]>> => {
    const params = buildParams(filters);
    const response = await http.get('/ventas', { params });
    return response.data;
  },

  // GET /ventas/:id
  getById: async (id: number): Promise<ApiResponse<Venta>> => {
    const response = await http.get(`/ventas/${id}`);
    return response.data;
  },

  // POST /ventas
  create: async (data: VentaRequest): Promise<ApiResponse<Venta>> => {
    const response = await http.post('/ventas', data);
    return response.data;
  },

  // PUT /ventas/:id
  update: async (id: number, data: VentaRequest): Promise<ApiResponse<Venta>> => {
    const response = await http.put(`/ventas/${id}`, data);
    return response.data;
  },

  // DELETE /ventas/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/ventas/${id}`);
  },

  // GET /ventas/tipos
  getTiposVenta: async (): Promise<ApiResponse<string[]>> => {
    // Implementación temporal - retorna tipos comunes de venta
    return {
      data: ['Venta directa', 'Subasta', 'Venta por peso', 'Venta por cabeza']
    };
  },
};
