import http from './http';
import type { 
  Usuario, 
  UsuarioRequest, 
  ApiResponse 
} from '../types/api';

export const usuariosApi = {
  // GET /usuarios
  getAll: async (): Promise<ApiResponse<Usuario[]>> => {
    const response = await http.get('/usuarios');
    return response.data;
  },

  // GET /usuarios/:id
  getById: async (id: number): Promise<ApiResponse<Usuario>> => {
    const response = await http.get(`/usuarios/${id}`);
    return response.data;
  },

  // POST /usuarios
  create: async (data: UsuarioRequest): Promise<ApiResponse<Usuario>> => {
    const response = await http.post('/usuarios', data);
    return response.data;
  },

  // PUT /usuarios/:id
  update: async (id: number, data: UsuarioRequest): Promise<ApiResponse<Usuario>> => {
    const response = await http.put(`/usuarios/${id}`, data);
    return response.data;
  },

  // DELETE /usuarios/:id
  delete: async (id: number): Promise<void> => {
    await http.delete(`/usuarios/${id}`);
  },
};
