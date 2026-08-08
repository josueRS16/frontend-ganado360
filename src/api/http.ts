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

// Interceptor para requests - incluir token automáticamente
http.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage
    const token = localStorage.getItem('token');
    
    // Incluir token en el header Authorization si existe
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[HTTP] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses - manejo de errores y autenticación
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    console.error('[HTTP] Response error:', error);
    
    let message = 'Error inesperado en el servidor';
    
    // Manejo específico de errores de autenticación y autorización
    if (error.response?.status === 401) {
      // Token expirado o inválido
      message = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      
      // Limpiar datos de sesión
      localStorage.removeItem('token');
      
      // Redirigir al login si no estamos ya ahí
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (error.response?.status === 403) {
      // Sin permisos
      message = 'No tienes permisos para realizar esta acción.';
    } else if (error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
      // Mensaje específico del backend
      message = (error.response.data as { message: string }).message;
    } else if (error.response?.status) {
      // Otros errores HTTP
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
