import { useState, useRef, useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { uploadApi } from '../../api/upload';
import { removeCachedAnimalImage } from '../../utils/imageCache';

interface ImageSelectorProps {
  value?: string | null;
  onChange: (imageUrl: string) => void;
  onClear: () => void;
  placeholder?: string;
  maxFileSize?: number; // en MB
  acceptedTypes?: string[];
  animalId?: number; // Para manejo de cache y eliminación
}

type ImageSourceType = 'url' | 'file';

export function ImageSelector({ 
  value, 
  onChange, 
  onClear,
  placeholder = "https://...",
  maxFileSize = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  animalId
}: ImageSelectorProps) {
  const [sourceType, setSourceType] = useState<ImageSourceType>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');
  const [urlValidationError, setUrlValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  // Detectar automáticamente el tipo de imagen al cargar o cambiar el valor
  useEffect(() => {
    if (value && value.trim()) {
      if (uploadApi.isLocalUploadedImage(value)) {
        setSourceType('file');
        setUrlInput(''); // Clear URL input when it's a file
      } else {
        setSourceType('url');
        setUrlInput(value); // Set URL input when it's an external URL
      }
    } else {
      // Reset to default when no value
      setSourceType('url');
      setUrlInput('');
    }
  }, [value]);

  const handleSourceTypeChange = (type: ImageSourceType) => {
    setSourceType(type);
    if (type === 'url') {
      setUrlInput(value || '');
    } else {
      setUrlInput('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (url: string) => {
    setUrlInput(url);
    // Solo llamar onChange si la URL es válida
    if (url.trim() && isValidUrl(url)) {
      onChange(url);
    } else if (!url.trim()) {
      // Si está vacía, limpiar
      onChange('');
    }
  };

  // Función para validar URLs
  const isValidUrl = (string: string): boolean => {
    try {
      const url = new URL(string);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  };


  // Debounced URL validation (validación básica)
  useEffect(() => {
    if (sourceType === 'url' && urlInput.trim()) {
      const timeoutId = setTimeout(() => {
        if (urlInput.trim()) {
          if (isValidUrl(urlInput)) {
            // Solo validar formato básico, no intentar cargar la imagen
            setUrlValidationError(null);
          } else {
            setUrlValidationError('Formato de URL inválido');
          }
        }
      }, 500); // Debounce más corto

      return () => clearTimeout(timeoutId);
    } else {
      setUrlValidationError(null);
    }
  }, [urlInput, sourceType]);

  const validateFile = (file: File): string | null => {
    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no permitido. Solo se permiten: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`;
    }

    // Validar tamaño
    const maxSizeBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxFileSize}MB`;
    }

    return null;
  };

  const uploadFile = async (file: File): Promise<string> => {
    const result = await uploadApi.uploadImage(file);
    return result.imageUrl;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar archivo
    const validationError = validateFile(file);
    if (validationError) {
      showToast(validationError, 'error');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploading(true);

    try {
      // Subir archivo al servidor directamente sin preview temporal
      const uploadedUrl = await uploadFile(file);
      
      // Actualizar con la URL final del servidor
      onChange(uploadedUrl);
      showToast('Imagen subida exitosamente', 'success');
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast('Error al subir la imagen', 'error');
      onClear();
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = async () => {
    try {
      if (value && value.trim()) {
        if (uploadApi.isLocalUploadedImage(value)) {
          // Es un archivo local - eliminar del servidor
          const filename = uploadApi.extractFilename(value);
          console.log(`[ImageSelector] Deleting local file. URL: ${value}, Filename: ${filename}`);
          
          if (filename) {
            try {
              console.log(`[ImageSelector] Attempting to delete file: ${filename}`);
              console.log(`[ImageSelector] Full image URL: ${value}`);
              
              // Probar conexión al servidor primero
              await uploadApi.testServerConnection();
              
              // Usar la función de prueba para obtener más información
              await uploadApi.testDeleteImage(filename);
              
              console.log(`[ImageSelector] Successfully deleted file: ${filename}`);
              showToast('Archivo eliminado exitosamente', 'success');
            } catch (error: unknown) {
              console.error('[ImageSelector] Error deleting uploaded file:', error);
              
              // Proporcionar mensaje de error más específico
              let errorMessage = 'Error al eliminar el archivo del servidor';
              if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as { response?: { status?: number } };
                if (axiosError.response?.status === 404) {
                  errorMessage = 'El archivo ya no existe en el servidor';
                } else if (axiosError.response?.status === 403) {
                  errorMessage = 'No tienes permisos para eliminar este archivo';
                }
              } else if (error && typeof error === 'object' && 'message' in error) {
                errorMessage = (error as { message: string }).message;
              }
              
              showToast(errorMessage, 'error');
              return; // No continuar si falla la eliminación
            }
          } else {
            console.warn(`[ImageSelector] Could not extract filename from URL: ${value}`);
            showToast('Error: No se pudo extraer el nombre del archivo', 'error');
            return;
          }
        } else {
          // Es URL externa - eliminar del localStorage
          if (animalId) {
            removeCachedAnimalImage(animalId);
          }
          showToast('Imagen externa eliminada del cache', 'success');
        }
      }
    } catch (error) {
      console.error('Error clearing image:', error);
      showToast('Error al eliminar la imagen', 'error');
      return;
    }

    // Limpiar el estado del componente solo si la eliminación fue exitosa
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClear();
  };

  const getPreviewImage = (): string | null => {
    if (sourceType === 'url') {
      // Mostrar preview si la URL tiene formato válido (no bloquear por validación de imagen)
      if (urlInput && isValidUrl(urlInput)) {
        return urlInput;
      }
      return value || null;
    }
    // Para archivos, siempre usar el value que viene del props
    return value || null;
  };

  return (
    <div className="image-selector">
      {/* Selector de tipo de fuente */}
      <div className="mb-3">
        <label className="form-label fw-semibold">Tipo de imagen</label>
        <div className="btn-group w-100" role="group">
          <input
            type="radio"
            className="btn-check"
            name="imageSource"
            id="urlSource"
            checked={sourceType === 'url'}
            onChange={() => handleSourceTypeChange('url')}
          />
          <label className="btn btn-outline-primary" htmlFor="urlSource">
            <i className="bi bi-link-45deg me-2"></i>
            URL de imagen
          </label>

          <input
            type="radio"
            className="btn-check"
            name="imageSource"
            id="fileSource"
            checked={sourceType === 'file'}
            onChange={() => handleSourceTypeChange('file')}
          />
          <label className="btn btn-outline-primary" htmlFor="fileSource">
            <i className="bi bi-upload me-2"></i>
            Subir archivo
          </label>
        </div>
      </div>

      {/* Input según el tipo seleccionado */}
      {sourceType === 'url' ? (
        <div>
          <div className="form-floating">
            <input
              type="url"
              className={`form-control ${urlValidationError ? 'is-invalid' : ''}`}
              id="imagenUrl"
              placeholder={placeholder}
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              maxLength={500}
            />
            <label htmlFor="imagenUrl">URL de Imagen</label>
          </div>
          
          {/* Indicadores de validación */}
          {urlValidationError && (
            <div className="form-text text-danger">
              <i className="bi bi-exclamation-triangle me-1"></i>
              {urlValidationError}
            </div>
          )}
          
          {urlInput && !urlValidationError && isValidUrl(urlInput) && (
            <div className="form-text text-success">
              <i className="bi bi-check-circle me-1"></i>
              Formato de URL válido
            </div>
          )}
        </div>
      ) : (
        <div>
          <label className="form-label">Seleccionar archivo</label>
          <input
            ref={fileInputRef}
            type="file"
            className="form-control"
            accept={acceptedTypes.join(',')}
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <div className="form-text">
            Formatos permitidos: {acceptedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}. 
            Tamaño máximo: {maxFileSize}MB
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {isUploading && (
        <div className="mt-2">
          <div className="d-flex align-items-center text-primary">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">Subiendo...</span>
            </div>
            <small>Subiendo imagen...</small>
          </div>
        </div>
      )}

      {/* Preview de la imagen */}
      {getPreviewImage() && !isUploading && (
        <div className="mt-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">Vista previa:</small>
              {sourceType === 'file' && value && uploadApi.isLocalUploadedImage(value) && (
                <span className="badge bg-success">
                  <i className="bi bi-cloud-check me-1"></i>
                  Archivo Subido
                </span>
              )}
              {sourceType === 'url' && value && !uploadApi.isLocalUploadedImage(value) && (
                <span className="badge bg-info">
                  <i className="bi bi-link-45deg me-1"></i>
                  URL Externa
                </span>
              )}
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={handleClear}
              title="Eliminar imagen"
            >
              <i className="bi bi-trash"></i>
            </button>
          </div>
          <img
            src={getPreviewImage() || ''}
            alt="Vista previa"
            className="img-thumbnail"
            style={{ maxHeight: 160, objectFit: 'cover' }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              console.warn('Image failed to load:', getPreviewImage());
              // No mostrar toast de error automáticamente, solo en consola
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', getPreviewImage());
            }}
          />
        </div>
      )}
    </div>
  );
}
