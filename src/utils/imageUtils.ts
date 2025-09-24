import { uploadApi } from '../api/upload';

/**
 * Utilidades para manejo de imágenes en la aplicación
 */

/**
 * Checks if a URL is external (cross-origin)
 */
export function isExternalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Obtiene la URL completa de una imagen, manejando tanto URLs externas como archivos subidos
 * @param imageUrl - URL de la imagen (puede ser externa o del servidor local)
 * @returns URL completa para mostrar la imagen
 */
export function getImageDisplayUrl(imageUrl: string | undefined): string | null {
  if (!imageUrl) return null;

  // Si ya es una URL completa (http/https), devolver tal como está
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es una ruta que incluye /uploads/, tratarla como archivo local
  if (imageUrl.includes('/uploads/')) {
    const filename = uploadApi.extractFilename(imageUrl) || imageUrl.split('/').pop();
    return filename ? uploadApi.getImageUrl(filename) : imageUrl;
  }

  // Si solo es un nombre de archivo, asumir que es del directorio uploads
  if (!imageUrl.includes('/') && !imageUrl.includes('\\')) {
    return uploadApi.getImageUrl(imageUrl);
  }

  // Para cualquier otro caso, devolver tal como está
  return imageUrl;
}

/**
 * Verifica si una URL de imagen es válida
 * @param imageUrl - URL a verificar
 * @returns Promise que resuelve con true si la imagen es válida
 */
export function validateImageUrl(imageUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUrl;
  });
}

/**
 * Formatea el tamaño de archivo en formato legible
 * @param bytes - Tamaño en bytes
 * @returns String formateado (ej: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Obtiene la extensión de un archivo
 * @param filename - Nombre del archivo
 * @returns Extensión del archivo (sin el punto)
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Verifica si un tipo MIME es una imagen soportada
 * @param mimeType - Tipo MIME a verificar
 * @returns true si es una imagen soportada
 */
export function isSupportedImageType(mimeType: string): boolean {
  const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return supportedTypes.includes(mimeType);
}
