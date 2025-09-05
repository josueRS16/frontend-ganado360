import http from './http';
import type { 
  Categoria, 
  CategoriaRequest, 
  UpdateCategoriaRequest,
  ApiResponse 
} from '../types/api';

export const categoriasApi = {
  // GET /categorias
  getAll: async (): Promise<ApiResponse<Categoria[]>> => {
    const response = await http.get('/categorias');
    return response.data;
  },

  // GET /categorias/:id
  getById: async (id: number): Promise<ApiResponse<Categoria>> => {
    const response = await http.get(`/categorias/${id}`);
    return response.data;
  },

  // POST /categorias
  create: async (data: CategoriaRequest): Promise<ApiResponse<Categoria>> => {
    const response = await http.post('/categorias', data);
    return response.data;
  },

  // PUT /categorias/:id
  update: async (id: number, data: UpdateCategoriaRequest): Promise<ApiResponse<Categoria>> => {
    const response = await http.put(`/categorias/${id}`, data);
    return response.data;
  },

  // DELETE /categorias/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/categorias/${id}`);
  },
};
