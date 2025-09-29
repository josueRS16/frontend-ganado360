import http from './http';
import type { Usuario, ApiResponse } from '../types/api';

export interface LoginRequest {
  Correo: string;
  Contraseña: string;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<Usuario>> => {
    const response = await http.post('/usuarios/login', data);
    return response.data;
  },
};
