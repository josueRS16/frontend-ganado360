import http from './http';


export const authApi = {
  login: async (data: { correo: string; password: string }) => {
    const response = await http.post('/auth/login', data);
    return response.data;
  },
};
