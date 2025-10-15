import http from './http';
import { buildParams } from '../utils/params';
import type { 
  Venta, 
  VentaRequest, 
  VentasFilters, 
  ApiResponse,
  PaginatedResponse,
  VentaFacturaPDF,
  VentasEstadisticas
} from '../types/api';

export const ventasApi = {
  // GET /ventas con filtros opcionales
  getAll: async (filters: VentasFilters = {}): Promise<PaginatedResponse<Venta[]>> => {
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

  // GET /ventas/:id/factura-pdf
  getFacturaPDF: async (id: number): Promise<ApiResponse<VentaFacturaPDF>> => {
    const response = await http.get(`/ventas/${id}/factura-pdf`);
    return response.data;
  },

  // GET /ventas/factura/numero/:numero
  getByNumeroFactura: async (numero: string): Promise<ApiResponse<Venta>> => {
    const response = await http.get(`/ventas/factura/numero/${numero}`);
    return response.data;
  },

  // GET /ventas/estadisticas
  getEstadisticas: async (filters: { fechaDesde?: string; fechaHasta?: string } = {}): Promise<ApiResponse<VentasEstadisticas>> => {
    const params = buildParams(filters);
    const response = await http.get('/ventas/estadisticas', { params });
    return response.data;
  },

  // GET /ventas/tipos
  getTiposVenta: async (): Promise<ApiResponse<string[]>> => {
    // Implementación temporal - retorna tipos comunes de venta
    return {
      data: ['Directa', 'Subasta', 'Venta por peso', 'Venta por cabeza']
    };
  },

  // GET /ventas/metodos-pago (helper local)
  getMetodosPago: (): string[] => {
    return ['Efectivo', 'Sinpe Móvil', 'Transferencia', 'Cheque', 'Tarjeta'];
  },
};
