import http from './http';
import { buildParams } from '../utils/params';
import type { 
  Animal, 
  CreateAnimalRequest,
  UpdateAnimalRequest,
  AnimalesFilters, 
  ApiResponse,
  PaginatedResponse,
  EstadoAnimal,
  HistorialVeterinario,
  Recordatorio
} from '../types/api';

export const animalesApi = {
  // GET /animales con filtros opcionales y paginación
  getAll: async (filters: AnimalesFilters = {}): Promise<PaginatedResponse<Animal[]>> => {
    const params = buildParams(filters);
    const response = await http.get('/animales', { params });
    return response.data;
  },

  // GET /animales/:id
  getById: async (id: number): Promise<ApiResponse<Animal>> => {
    const response = await http.get(`/animales/${id}`);
    return response.data;
  },

  // POST /animales
  create: async (data: CreateAnimalRequest): Promise<ApiResponse<Animal>> => {
    const response = await http.post('/animales', data);
    return response.data;
  },

  // PUT /animales/:id
  update: async (id: number, data: UpdateAnimalRequest): Promise<ApiResponse<Animal>> => {
    const response = await http.put(`/animales/${id}`, data);
    return response.data;
  },

  // DELETE /animales/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/animales/${id}`);
  },

  // GET /animales-con-detalle
  getAllWithDetail: async (): Promise<ApiResponse<Animal[]>> => {
    const response = await http.get('/animales/con-detalle');
    return response.data;
  },

  // GET /animales/:id/estado
  getEstado: async (id: number): Promise<ApiResponse<EstadoAnimal>> => {
    const response = await http.get(`/animales/${id}/estado`);
    return response.data;
  },

  // GET /animales/:id/historial
  getHistorial: async (id: number): Promise<ApiResponse<HistorialVeterinario[]>> => {
    const response = await http.get(`/animales/${id}/historial`);
    return response.data;
  },

  // GET /animales/:id/recordatorios
  getRecordatorios: async (id: number): Promise<ApiResponse<Recordatorio[]>> => {
    const response = await http.get(`/animales/${id}/recordatorios`);
    return response.data;
  },
};
