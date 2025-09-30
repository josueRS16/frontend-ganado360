import axios, { type AxiosResponse, type AxiosError } from 'axios';

// Crear instancia de Axios con configuración base
const baseURL = import.meta.env.VITE_API_URL;

// Validar que la URL base esté configurada
if (!baseURL) {
  console.error('❌ VITE_API_URL no está configurada en las variables de entorno');
  throw new Error('VITE_API_URL is required');
}


const http = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requests - log de auditoría
http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    console.error('[HTTP] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('[HTTP] Response error:', error);
    
    let message = 'Error inesperado en el servidor';
    
    if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      message = (error.response.data as { message: string }).message;
    } else if (error.response?.status) {
      switch (error.response.status) {
        case 400:
          message = 'Datos inválidos en la solicitud';
          break;
        case 404:
          message = 'Recurso no encontrado';
          break;
        case 409:
          message = 'Conflicto: el recurso ya existe';
          break;
        case 500:
          message = 'Error interno del servidor';
          break;
      }
    } else if (error.code === 'ECONNREFUSED') {
      message = 'No se puede conectar al servidor';
    }
    
    return Promise.reject({
      message,
      status: error.response?.status,
      originalError: error,
    });
  }
);

export default http;
