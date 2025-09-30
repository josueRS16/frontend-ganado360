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
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
    } catch (error: unknown) {
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
  // ...existing code...
};
