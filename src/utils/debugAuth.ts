/**
 * Utilidad para debugging de autenticación
 * Verifica que el token se esté incluyendo en todas las solicitudes
 */

import http from '../api/http';

export const debugAuth = {
  // Verificar si hay token en localStorage
  checkToken: () => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token en localStorage:', token ? '✅ Presente' : '❌ Ausente');
    if (token) {
      console.log('📝 Token (primeros 20 caracteres):', token.substring(0, 20) + '...');
    }
    return !!token;
  },

  // Probar una solicitud para verificar headers
  testRequest: async () => {
    try {
      console.log('🧪 Probando solicitud con token...');
      
      // Interceptar la próxima solicitud para verificar headers
      const originalRequest = http.interceptors.request.use(
        (config) => {
          console.log('📤 Headers de la solicitud:', config.headers);
          console.log('🔐 Authorization header:', config.headers.Authorization);
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Hacer una solicitud de prueba (perfil del usuario)
      const response = await http.get('/auth/profile');
      console.log('✅ Solicitud exitosa:', response.status);
      
      // Remover el interceptor temporal
      http.interceptors.request.eject(originalRequest);
      
      return true;
    } catch (error: any) {
      console.error('❌ Error en solicitud de prueba:', error.message);
      console.error('📊 Status:', error.status);
      return false;
    }
  },

  // Verificar todos los módulos de API
  testAllModules: async () => {
    const modules = [
      { name: 'Auth Profile', test: () => http.get('/auth/profile') },
      { name: 'Animales', test: () => http.get('/animales') },
      { name: 'Usuarios', test: () => http.get('/usuarios') },
      { name: 'Ventas', test: () => http.get('/ventas') },
      { name: 'Categorías', test: () => http.get('/categorias') },
      { name: 'Estados', test: () => http.get('/estados') },
      { name: 'Roles', test: () => http.get('/roles') },
      { name: 'Recordatorios', test: () => http.get('/recordatorios') },
      { name: 'Historial', test: () => http.get('/historial') },
    ];

    console.log('🧪 Probando todos los módulos de API...');
    
    for (const module of modules) {
      try {
        await module.test();
        console.log(`✅ ${module.name}: Token incluido correctamente`);
      } catch (error: any) {
        if (error.status === 401) {
          console.log(`🔐 ${module.name}: Token requerido (correcto)`);
        } else if (error.status === 403) {
          console.log(`🚫 ${module.name}: Sin permisos (correcto)`);
        } else {
          console.log(`❌ ${module.name}: Error inesperado - ${error.message}`);
        }
      }
    }
  },

  // Limpiar token (para testing)
  clearToken: () => {
    localStorage.removeItem('token');
    console.log('🗑️ Token eliminado del localStorage');
  },

  // Establecer token (para testing)
  setToken: (token: string) => {
    localStorage.setItem('token', token);
    console.log('💾 Token guardado en localStorage');
  }
};

// Exponer en window para debugging desde consola
if (typeof window !== 'undefined') {
  (window as any).debugAuth = debugAuth;
  console.log('🛠️ Debug de autenticación disponible en window.debugAuth');
  console.log('📖 Comandos disponibles:');
  console.log('  - debugAuth.checkToken()');
  console.log('  - debugAuth.testRequest()');
  console.log('  - debugAuth.testAllModules()');
  console.log('  - debugAuth.clearToken()');
  console.log('  - debugAuth.setToken("tu_token")');
}
