import http from '../api/http';
import type { UsuarioRequest, ApiResponse, Usuario } from '../types/api';

export const registerApi = {
  register: async (data: UsuarioRequest): Promise<ApiResponse<Usuario>> => {
    const response = await http.post('/usuarios', data);
    return response.data;
  },
};
