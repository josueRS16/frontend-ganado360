import http from './http';
import { buildParams } from '../utils/params';
import type { 
  EstadoAnimal, 
  EstadoAnimalRequest, 
  EstadoAnimalFilters, 
  ApiResponse 
} from '../types/api';

export const estadoAnimalApi = {
  // GET /estado-animal con filtros opcionales
  getAll: async (filters: EstadoAnimalFilters = {}): Promise<ApiResponse<EstadoAnimal[]>> => {
    const params = buildParams(filters);
    const response = await http.get('/estado-animal', { params });
    return response.data;
  },

  // GET /estado-animal/:id
  getById: async (id: number): Promise<ApiResponse<EstadoAnimal>> => {
    const response = await http.get(`/estado-animal/${id}`);
    return response.data;
  },

  // POST /estado-animal
  create: async (data: EstadoAnimalRequest): Promise<ApiResponse<EstadoAnimal>> => {
    const response = await http.post('/estado-animal', data);
    return response.data;
  },

  // PUT /estado-animal/:id
  update: async (id: number, data: EstadoAnimalRequest): Promise<ApiResponse<EstadoAnimal>> => {
    const response = await http.put(`/estado-animal/${id}`, data);
    return response.data;
  },

  // DELETE /estado-animal/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/estado-animal/${id}`);
  },

  // PUT /estado-animal/:id (cambiar estado a "Baja" con fecha de fallecimiento)
  darDeBaja: async (params: { idEstadoAnimal: number; fechaFallecimiento: string }): Promise<void> => {
    await http.put(`/estado-animal/${params.idEstadoAnimal}`, {
      ID_Estado: 10, // Estado "baja"
      Fecha_Fallecimiento: params.fechaFallecimiento
    });
  },
};
