import http from './http';

export interface UploadResponse {
  success: boolean;
  imageUrl: string;
  filename: string;
  originalName: string;
  size: number;
}

export const uploadApi = {
  // POST /upload/image
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    // Crear una instancia especial para upload que no use JSON headers
    const response = await http.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 segundos para uploads
    });

    return response.data;
  },

  // DELETE /api/upload/image/:filename
  deleteImage: async (filename: string): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_URL;
    const fullUrl = `${baseURL}/upload/image/${filename}`;
    
    try {
      const response = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[UploadAPI] Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      console.log(`[UploadAPI] Successfully deleted file: ${filename}`);
    } catch (error: unknown) {
      console.error(`[UploadAPI] Error deleting file ${filename}:`, error);
      throw error;
    }
  },

  // GET para obtener la URL completa de una imagen
  getImageUrl: (filename: string): string => {
    const baseURL = import.meta.env.VITE_API_URL;
    return `${baseURL}/uploads/${filename}`;
  },

  // Función auxiliar para extraer el nombre del archivo de una URL
  extractFilename: (imageUrl: string): string | null => {
    // Intentar con URL absoluta
    try {
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const uploadsIndex = pathSegments.indexOf('uploads');
      if (uploadsIndex !== -1 && uploadsIndex < pathSegments.length - 1) {
        return pathSegments[uploadsIndex + 1];
      }
    } catch {
      // Si no es una URL absoluta, tratar como ruta relativa o string cualquiera
      const normalized = imageUrl.trim();
      const marker = '/uploads/';
      const idx = normalized.indexOf(marker);
      if (idx !== -1) {
        const after = normalized.substring(idx + marker.length);
        const slashIdx = after.indexOf('/');
        return slashIdx === -1 ? after : after.substring(0, slashIdx);
      }
    }
    return null;
  },

  // Función para validar si una URL es una imagen local subida
  isLocalUploadedImage: (imageUrl: string): boolean => {
    if (!imageUrl) return false;
    const val = imageUrl.trim();
    // Considerar tanto absoluta con baseURL como relativa o cualquier origen
    if (val.includes('/uploads/')) return true;
    const baseURL = import.meta.env.VITE_API_URL;
    return !!baseURL && val.startsWith(`${baseURL}/uploads/`);
  },

  // Función de prueba para diagnosticar problemas con deleteImage
  testDeleteImage: async (filename: string): Promise<void> => {
    console.log(`[UploadAPI] Testing deleteImage with filename: ${filename}`);
    console.log(`[UploadAPI] VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
    console.log(`[UploadAPI] Full URL will be: ${import.meta.env.VITE_API_URL}/api/upload/image/${filename}`);
    
    try {
      await uploadApi.deleteImage(filename);
      console.log(`[UploadAPI] Test successful!`);
    } catch (error) {
      console.error(`[UploadAPI] Test failed:`, error);
      throw error;
    }
  },

  // Función para probar la conectividad del servidor
  testServerConnection: async (): Promise<void> => {
    const baseURL = import.meta.env.VITE_API_URL;
    console.log(`[UploadAPI] Testing server connection to: ${baseURL}`);
    
    try {
      const response = await fetch(`${baseURL}/api/health`, {
        method: 'GET',
      });
      console.log(`[UploadAPI] Health check status: ${response.status}`);
    } catch (error) {
      console.error(`[UploadAPI] Health check failed:`, error);
    }
  },

  // Función de debugging global
  debugDeleteImage: async (filename: string): Promise<void> => {
    console.log('=== DEBUG DELETE IMAGE ===');
    console.log(`Filename: ${filename}`);
    console.log(`VITE_API_URL: ${import.meta.env.VITE_API_URL}`);
    
    const baseURL = import.meta.env.VITE_API_URL;
    const fullUrl = `${baseURL}/api/upload/image/${filename}`;
    console.log(`Full URL: ${fullUrl}`);
    
    try {
      console.log('Testing server connection...');
      const healthResponse = await fetch(`${baseURL}/api/health`);
      console.log(`Health check: ${healthResponse.status}`);
      
      console.log('Attempting DELETE request...');
      const deleteResponse = await fetch(fullUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log(`DELETE Response Status: ${deleteResponse.status}`);
      console.log(`DELETE Response OK: ${deleteResponse.ok}`);
      
      if (!deleteResponse.ok) {
        const errorText = await deleteResponse.text();
        console.error(`DELETE Error: ${errorText}`);
      } else {
        console.log('DELETE successful!');
      }
      
    } catch (error) {
      console.error('DELETE failed:', error);
    }
    
    console.log('=== END DEBUG ===');
  }
};

// Hacer la función de debugging disponible globalmente
(window as unknown as { debugDeleteImage: typeof uploadApi.debugDeleteImage }).debugDeleteImage = uploadApi.debugDeleteImage;
