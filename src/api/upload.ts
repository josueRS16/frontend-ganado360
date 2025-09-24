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

  // DELETE /upload/image/:filename
  deleteImage: async (filename: string): Promise<void> => {
    const url = `/upload/image/${filename}`;
    console.log(`[UploadAPI] Attempting DELETE request to: ${url}`);
    
    try {
      await http.delete(url);
      console.log(`[UploadAPI] Successfully deleted file: ${filename}`);
    } catch (error) {
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
    try {
      const url = new URL(imageUrl);
      const pathSegments = url.pathname.split('/');
      const uploadsIndex = pathSegments.indexOf('uploads');
      
      if (uploadsIndex !== -1 && uploadsIndex < pathSegments.length - 1) {
        return pathSegments[uploadsIndex + 1];
      }
      
      return null;
    } catch {
      return null;
    }
  },

  // Función para validar si una URL es una imagen local subida
  isLocalUploadedImage: (imageUrl: string): boolean => {
    const baseURL = import.meta.env.VITE_API_URL;
    return imageUrl.startsWith(`${baseURL}/uploads/`);
  }
};
