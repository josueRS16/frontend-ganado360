import http from './http';
import type {
  LoginResponse,
  PerfilUsuario,
  UpdateUsuarioPerfilRequest,
  ApiResponse
} from '../types/api';

export const authApi = {
  // Login
  login: async (data: { correo: string; password: string; captchaToken: string }): Promise<LoginResponse> => {
    const response = await http.post('/auth/login', data);
    return response.data;
  },

  // Obtener perfil del usuario autenticado
  getProfile: async (): Promise<ApiResponse<PerfilUsuario>> => {
    const response = await http.get('/auth/profile');
    return response.data;
  },

  // Actualizar perfil del usuario autenticado
  updateProfile: async (data: UpdateUsuarioPerfilRequest): Promise<ApiResponse<PerfilUsuario>> => {
    const response = await http.put('/auth/profile', data);
    return response.data;
  },
};

