import http from './http';


export const authApi = {
  login: async (data: { correo: string; password: string; captchaToken: string }) => {
    const response = await http.post('/auth/login', data);
    return response.data;
  },
  // Password recovery endpoints were removed from the backend; keep login only.
};

