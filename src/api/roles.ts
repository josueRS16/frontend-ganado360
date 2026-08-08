import http from './http';
import type { 
  Rol, 
  RolRequest, 
  RolesFilters,
  ApiResponse,
  PaginatedResponse 
} from '../types/api';

export const rolesApi = {
  // GET /roles con filtros y paginación
  getAll: async (filters: RolesFilters = {}): Promise<PaginatedResponse<Rol[]>> => {
    const response = await http.get('/roles', { params: filters });
    return response.data;
  },

  // GET /roles/:id
  getById: async (id: number): Promise<ApiResponse<Rol>> => {
    const response = await http.get(`/roles/${id}`);
    return response.data;
  },

  // POST /roles
  create: async (data: RolRequest): Promise<ApiResponse<Rol>> => {
    const response = await http.post('/roles', data);
    return response.data;
  },

  // PUT /roles/:id
  update: async (id: number, data: RolRequest): Promise<ApiResponse<Rol>> => {
    const response = await http.put(`/roles/${id}`, data);
    return response.data;
  },

  // DELETE /roles/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/roles/${id}`);
  },
};
