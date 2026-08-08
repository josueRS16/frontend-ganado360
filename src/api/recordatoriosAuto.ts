import http from './http';
import type { Recordatorio } from '../types/api';

export const recordatoriosAutoApi = {
  getAutomaticos: async (): Promise<Recordatorio[]> => {
    const response = await http.get('/recordatorios/auto');
    return response.data.data;
  },
};
