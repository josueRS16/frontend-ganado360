import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

// Utility function to calculate estimated birth date
const calculateEstimatedBirthDate = (matingDate: string | null) => {
  if (!matingDate) return null;
  const matingDateObj = new Date(matingDate);
  matingDateObj.setDate(matingDateObj.getDate() + 283); // Add 283 days (average gestation period for cattle)
  return matingDateObj.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
};

export function AnimalForm({ animal, isOpen, onClose, onSuccess }: AnimalFormProps) {
  const { t } = useTranslation();
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
    showToast(t('animals.messages.createSuccess'), 'success');
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
    if (!animal) throw new Error(t('animals.messages.updateSuccess'));
    
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
    showToast(t('animals.messages.updateSuccess'), 'success');
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
      const errorMessage = error instanceof Error ? error.message : t('animals.messages.deleteError');
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
              {animal ? t('animals.editAnimal') : t('animals.newAnimal')}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label={t('animals.form.close')}
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Información Básica */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-info-circle-fill me-2"></i>
                    {t('animals.form.basicInfo')}
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
                          placeholder={t('animals.form.animalName')}
                          value={formData.Nombre}
                          onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                          required
                        />
                        <label htmlFor="nombre">{t('animals.form.animalName')}</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="sexo"
                          value={formData.Sexo}
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
                          <option value="">{t('animals.form.selectSex')}</option>
                          <option value="M">{t('animals.form.male')}</option>
                          <option value="F">{t('animals.form.female')}</option>
                        </select>
                        <label htmlFor="sexo">{t('animals.form.gender')}</label>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="categoria"
                          value={formData.ID_Categoria}
                          onChange={(e) => setFormData({ ...formData, ID_Categoria: Number(e.target.value) })}
                          required
                        >
                          <option value="">{t('animals.form.selectCategory')}</option>
                          {categorias.map(categoria => (
                            <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                              {categoria.Tipo}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="categoria">{t('animals.form.category')}</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <select
                          className="form-select raza-select"
                          id="raza"
                          value={formData.Raza}
                          onChange={(e) => setFormData({ ...formData, Raza: e.target.value })}
                          required
                        >
                          <option value="">{t('animals.form.selectRace')}</option>
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
                        <label htmlFor="raza">{t('animals.form.race')}</label>
                      </div>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        {t('animals.form.raceHelp')}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="color"
                          placeholder={t('animals.form.color')}
                          value={formData.Color}
                          onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                          required
                        />
                        <label htmlFor="color">{t('animals.form.color')}</label>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-floating">
                        <input
                          type="number"
                          className="form-control"
                          id="peso"
                          placeholder={t('animals.form.weight')}
                          value={formData.Peso || ''}
                          onChange={(e) => setFormData({ ...formData, Peso: Number(e.target.value) })}
                          required
                        />
                        <label htmlFor="peso">{t('animals.form.weight')}</label>
                      </div>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-semibold">{t('animals.form.animalImage')}</label>
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
                    {t('animals.form.importantDates')}
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
                        <label htmlFor="fechaNacimiento">{t('animals.form.birthDate')}</label>
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
                        <label htmlFor="fechaIngreso">{t('animals.form.entryDate')}</label>
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
                    {t('animals.form.reproductiveStatus')}
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
                            <option value="">{t('animals.form.selectSexFirst')}</option>
                          ) : formData.Sexo !== "F" ? (
                            <>
                              <option value="false">{t('animals.form.notPregnant')}</option>
                            </>
                          ) : (
                            <>
                              <option value="false">{t('animals.form.notPregnant')}</option>
                              <option value="true">{t('animals.form.pregnant')}</option>
                            </>
                          )}
                        </select>
                        <label htmlFor="estaPreniada">{t('animals.form.reproductiveStatus')}</label>
                      </div>
                      {formData.Sexo === "M" && (
                        <div className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          {t('animals.form.maleCannotPregnant')}
                        </div>
                      )}
                      {formData.Sexo === null && (
                        <div className="form-text text-muted">
                          <i className="bi bi-info-circle me-1"></i>
                          {t('animals.form.selectSexAnimal')}
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
                            <label htmlFor="fechaEstimadaParto">{t('animals.form.estimatedBirthDate')}</label>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-floating">
                            <input
                              type="date"
                              className="form-control"
                              id="fechaMonta"
                              value={formData.Fecha_Monta || ''}
                              onChange={(e) => {
                                const matingDate = e.target.value || null;
                                const estimatedBirthDate = matingDate ? calculateEstimatedBirthDate(matingDate) : null;
                                setFormData({ ...formData, Fecha_Monta: matingDate, Fecha_Estimada_Parto: estimatedBirthDate });
                              }}
                            />
                            <p className="small text-muted">{t('animals.form.optional')}</p>
                            <label htmlFor="fechaMonta">{t('animals.form.mountingDate')}</label>
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
                      {t('animals.form.saving')}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${animal ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                      {animal ? t('animals.form.update') : t('animals.form.create')}
                    </>
                  )}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  {t('animals.form.cancel')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
