import http from './http';
import type { Usuario, ApiResponse } from '../types/api';

export interface LoginRequest {
  Correo: string;
  Contraseña: string;
}

export const authApi = {
  login: async (data: { correo: string; password: string }) => {
    const response = await http.post('/auth/login', data);
    return response.data;
  },
};
