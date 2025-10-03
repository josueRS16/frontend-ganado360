import { useState, useEffect } from 'react';
import { useCreateAnimal, useUpdateAnimal } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useToast } from '../hooks/useToast';
import type { Animal, CreateAnimalRequest } from '../types/api';
import { cacheAnimalImage } from '../utils/imageCache';
import { ImageSelector } from '../components/ui/ImageSelector';
import { getRazasPorCategoria } from '../utils/razasBovinas';
import { uploadApi } from '../api/upload';
import '../styles/razas-select.css';

interface AnimalFormProps {
  animal?: Animal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Helper function to create initial form data
const createInitialFormData = (animal?: Animal): CreateAnimalRequest => {
/*   const sex = (animal?.Sexo as "M" | "F") || "M"; */
  const sex = (animal?.Sexo as "M" | "F") || null;

  const isMale = sex === "M";
  
  return {
    Nombre: animal?.Nombre || '',
    Sexo: sex,
    Color: animal?.Color || '',
    Peso: Number(animal?.Peso) || 0,
    Fecha_Nacimiento: animal?.Fecha_Nacimiento ? animal.Fecha_Nacimiento.split('T')[0] : '',
    Raza: animal?.Raza || '',
    // Ensure male animals cannot be pregnant
    Esta_Preniada: isMale ? false : (animal?.Esta_Preniada === 1),
    Fecha_Monta: isMale ? null : (animal?.Fecha_Monta ? animal.Fecha_Monta.split('T')[0] : null),
    Fecha_Estimada_Parto: isMale ? null : (animal?.Fecha_Estimada_Parto ? animal.Fecha_Estimada_Parto.split('T')[0] : null),
    Fecha_Ingreso: animal?.Fecha_Ingreso ? animal.Fecha_Ingreso.split('T')[0] : '',
    /* ID_Categoria: animal?.ID_Categoria || 1, */
    ID_Categoria: animal?.ID_Categoria || 0,
    Imagen_URL: animal?.Imagen_URL || null,
  };
};

export function AnimalForm({ animal, isOpen, onClose, onSuccess }: AnimalFormProps) {
  const { data: categoriasData } = useCategorias();
  const categorias = categoriasData?.data || [];
  const createMutation = useCreateAnimal();
  const updateMutation = useUpdateAnimal();
  const { showToast } = useToast();

  // Obtener razas agrupadas por categoría
  const razasPorCategoria = getRazasPorCategoria();

  const [formData, setFormData] = useState<CreateAnimalRequest>(createInitialFormData(animal));

  // Update form data when animal prop changes
  useEffect(() => {
    setFormData(createInitialFormData(animal));
  }, [animal]);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData(createInitialFormData());
    onClose();
  };

  const handleCreateAnimal = async () => {
    const payload: CreateAnimalRequest = {
      ...formData,
      Imagen_URL: formData.Imagen_URL && formData.Imagen_URL.trim().length > 0 ? formData.Imagen_URL.trim().slice(0, 500) : null,
    };
    const resp = await createMutation.mutateAsync(payload);
    showToast('Animal creado exitosamente', 'success');
    const createdId = resp.data.ID_Animal;
    if (payload.Imagen_URL) {
      cacheAnimalImage(createdId, payload.Imagen_URL);
    }
    setFormData(createInitialFormData());
    // Refrescar contador/tabla de notificaciones si existe función global
    if (window.updateNotificationCount) {
      window.updateNotificationCount();
    }
  };

  const handleUpdateAnimal = async () => {
    if (!animal) throw new Error('No se puede actualizar: animal no especificado');
    
    const newImageUrl = formData.Imagen_URL && formData.Imagen_URL.trim().length > 0 ? formData.Imagen_URL.trim().slice(0, 500) : null;

    // NOTA: La eliminación de archivos se maneja desde el botón "eliminar imagen" 
    // que envía DELETE request al backend. Aquí solo actualizamos la información.

    const payload: CreateAnimalRequest = {
      ...formData,
      Imagen_URL: newImageUrl,
    };

    await updateMutation.mutateAsync({
      id: animal.ID_Animal,
      data: payload
    });
    showToast('Animal actualizado exitosamente', 'success');
    // Cachear nueva imagen si es externa
    if (payload.Imagen_URL && !uploadApi.isLocalUploadedImage(payload.Imagen_URL)) {
      cacheAnimalImage(animal.ID_Animal, payload.Imagen_URL);
    }
    // Refrescar contador/tabla de notificaciones si existe función global
    if (window.updateNotificationCount) {
      window.updateNotificationCount();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (animal) {
        await handleUpdateAnimal();
      } else {
        await handleCreateAnimal();
      }
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el animal';
      showToast(errorMessage, 'error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className={`bi ${animal ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
              {animal ? 'Editar Animal' : 'Nuevo Animal'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Cerrar modal"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Información Básica */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    Información Básica
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          placeholder="Nombre del animal"
                          value={formData.Nombre}
                          onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                          required
                        />
                        <label htmlFor="nombre">Nombre del Animal</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="sexo"
                          value={formData.Sexo ?? ""}
                          onChange={(e) => {
                            const newSex = e.target.value as "M" | "F";
                            // Reset pregnancy-related fields when switching to male
                            if (newSex === "M") {
                              setFormData({ 
                                ...formData, 
                                Sexo: newSex,
                                Esta_Preniada: false,
                                Fecha_Monta: null,
                                Fecha_Estimada_Parto: null
                              });
                            } else {
                              setFormData({ ...formData, Sexo: newSex });
                            }
                          }}
                          required
                        >
                          <option value="">Seleccionar</option>
                          <option value="M">Macho</option>
                          <option value="F">Hembra</option>
                        </select>
                        <label htmlFor="sexo">Sexo</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="categoria"
                          value={formData.ID_Categoria ?? ""}
                          onChange={(e) => setFormData({ ...formData, ID_Categoria: Number(e.target.value) })}
                          required
                        >
                          <option value="">Seleccionar</option>
                          {categorias.map(categoria => (
                            <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                              {categoria.Tipo}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="categoria">Categoría</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <select
                          className="form-select raza-select"
                          id="raza"
                          value={formData.Raza ?? ""}
                          onChange={(e) => setFormData({ ...formData, Raza: e.target.value })}
                          required
                        >
                          <option value="">Seleccionar raza</option>
                          {Object.entries(razasPorCategoria).map(([categoria, razas]) => (
                            <optgroup key={categoria} label={categoria}>
                              {razas.map((raza) => (
                                <option key={raza} value={raza}>
                                  {raza}
                                </option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                        <label htmlFor="raza">Raza</label>
                      </div>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Selecciona la raza bovina más apropiada
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="color"
                          placeholder="Color del animal"
                          value={formData.Color}
                          onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                          required
                        />
                        <label htmlFor="color">Color</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          id="peso"
                          placeholder="Peso en kg"
                          value={formData.Peso || ''}
                          onChange={(e) => setFormData({ ...formData, Peso: Number(e.target.value) })}
                          required
                        />
                        <label htmlFor="peso">Peso (kg)</label>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">Imagen del Animal</label>
                      <ImageSelector
                        value={formData.Imagen_URL ?? null}
                        onChange={(imageUrl) => setFormData({ ...formData, Imagen_URL: imageUrl })}
                        onClear={() => setFormData({ ...formData, Imagen_URL: null })}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        maxFileSize={5}
                        animalId={animal?.ID_Animal}
                        acceptedTypes={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas Importantes */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{ background: 'var(--color-tint1)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-calendar-event me-2"></i>
                    Fechas Importantes
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="date"
                          className="form-control"
                          id="fechaNacimiento"
                          value={formData.Fecha_Nacimiento}
                          onChange={(e) => setFormData({ ...formData, Fecha_Nacimiento: e.target.value })}
                          required
                        />
                        <label htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="date"
                          className="form-control"
                          id="fechaIngreso"
                          value={formData.Fecha_Ingreso}
                          onChange={(e) => setFormData({ ...formData, Fecha_Ingreso: e.target.value })}
                          required
                        />
                        <label htmlFor="fechaIngreso">Fecha de Ingreso</label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Estado Reproductivo */}
              <div className="card border-0 shadow-sm">
                <div className="card-header" style={{ background: 'var(--color-slate)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-heart-pulse me-2"></i>
                    Estado Reproductivo
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="estaPreniada"
                          value={formData.Sexo === null ? "" : (formData.Esta_Preniada ? "true" : "false")}
                          onChange={(e) => setFormData({ ...formData, Esta_Preniada: e.target.value === "true" })}
                          disabled={formData.Sexo === null || formData.Sexo !== "F"}
                        >
                          {formData.Sexo === null ? (
                            <option value="">Seleccione sexo</option>
                          ) : formData.Sexo !== "F" ? (
                            <>
                              <option value="false">No preñada</option>
                            </>
                          ) : (
                            <>
                              <option value="false">No preñada</option>
                              <option value="true">Preñada</option>
                            </>
                          )}
                        </select>
                        <label htmlFor="estaPreniada">Estado Reproductivo</label>
                      </div>
                      {formData.Sexo === "M" && (
                        <div className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Los machos no pueden estar preñados
                        </div>
                      )}
                      {formData.Sexo === null && (
                        <div className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          Seleccione primero el sexo del animal
                        </div>
                      )}
                    </div>
                    {formData.Esta_Preniada && formData.Sexo === "F" && (
                      <>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="date"
                              className="form-control"
                              id="fechaEstimadaParto"
                              value={formData.Fecha_Estimada_Parto || ''}
                              onChange={(e) => setFormData({ ...formData, Fecha_Estimada_Parto: e.target.value || null })}
                            />
                            <label htmlFor="fechaEstimadaParto">Fecha Estimada de Parto</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="date"
                              className="form-control"
                              id="fechaMonta"
                              value={formData.Fecha_Monta || ''}
                              onChange={(e) => setFormData({ ...formData, Fecha_Monta: e.target.value || null })}
                            />
                            <p className="small text-muted">(Opcional)</p>
                            <label htmlFor="fechaMonta">Fecha de Monta</label>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)'}}>
              <div className="d-flex justify-content-end gap-2 w-100">
              <button 
                  type="submit" 
                  className="btn btn-apply"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <i className={`bi ${animal ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {animal ? 'Actualizar' : 'Crear'}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
