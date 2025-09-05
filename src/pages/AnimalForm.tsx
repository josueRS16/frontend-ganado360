import { useState, useEffect } from 'react';
import { useCreateAnimal, useUpdateAnimal } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useToast } from '../context/ToastContext';
import type { Animal, CreateAnimalRequest } from '../types/api';

interface AnimalFormProps {
  animal?: Animal;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// Helper function to create initial form data
const createInitialFormData = (animal?: Animal): CreateAnimalRequest => {
  const sex = (animal?.Sexo as "M" | "F") || "M";
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
    ID_Categoria: animal?.ID_Categoria || 1,
  };
};

export function AnimalForm({ animal, isOpen, onClose, onSuccess }: AnimalFormProps) {
  const { data: categoriasData } = useCategorias();
  const categorias = categoriasData?.data || [];
  const createMutation = useCreateAnimal();
  const updateMutation = useUpdateAnimal();
  const { showToast } = useToast();

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
    await createMutation.mutateAsync(formData);
    showToast('Animal creado exitosamente', 'success');
  };

  const handleUpdateAnimal = async () => {
    if (!animal) throw new Error('No se puede actualizar: animal no especificado');
    
    await updateMutation.mutateAsync({
      id: animal.ID_Animal,
      data: formData
    });
    showToast('Animal actualizado exitosamente', 'success');
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
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-success shadow-lg">
          <div className="modal-header bg-success text-white">
            <h5 className="modal-title fw-bold">
              <span className="me-2">🐄</span>
              {animal ? 'Editar Animal' : 'Nuevo Animal'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="nombre" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombre"
                    value={formData.Nombre}
                    onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="sexo" className="form-label">Sexo</label>
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
                    <option value="">Seleccionar sexo</option>
                    <option value="M">Macho</option>
                    <option value="F">Hembra</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="categoria" className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    id="categoria"
                    value={formData.ID_Categoria}
                    onChange={(e) => setFormData({ ...formData, ID_Categoria: Number(e.target.value) })}
                    required
                  >
                    {categorias.map(categoria => (
                      <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                        {categoria.Tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="raza" className="form-label">Raza</label>
                  <input
                    type="text"
                    className="form-control"
                    id="raza"
                    value={formData.Raza}
                    onChange={(e) => setFormData({ ...formData, Raza: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="color" className="form-label">Color</label>
                  <input
                    type="text"
                    className="form-control"
                    id="color"
                    value={formData.Color}
                    onChange={(e) => setFormData({ ...formData, Color: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="peso" className="form-label">Peso</label>
                  <input
                    type="number"
                    className="form-control"
                    id="peso"
                    value={formData.Peso}
                    onChange={(e) => setFormData({ ...formData, Peso: Number(e.target.value) })}
                    placeholder="Ej: 450"
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="fechaNacimiento" className="form-label">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaNacimiento"
                    value={formData.Fecha_Nacimiento}
                    onChange={(e) => setFormData({ ...formData, Fecha_Nacimiento: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="fechaIngreso" className="form-label">Fecha de Ingreso</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaIngreso"
                    value={formData.Fecha_Ingreso}
                    onChange={(e) => setFormData({ ...formData, Fecha_Ingreso: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="estaPreniada" className="form-label">Estado Reproductivo</label>
                  <select
                    className="form-select"
                    id="estaPreniada"
                    value={formData.Esta_Preniada ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, Esta_Preniada: e.target.value === "true" })}
                    disabled={formData.Sexo === "M"}
                  >
                    <option value="false">
                      {formData.Sexo === "M" ? "No aplica (Macho)" : "No preñada"}
                    </option>
                    <option value="true" disabled={formData.Sexo === "M"}>
                      {formData.Sexo === "M" ? "No aplica (Macho)" : "Preñada"}
                    </option>
                  </select>
                  {formData.Sexo === "M" && (
                    <div className="form-text text-muted">
                      <small>Los machos no pueden estar preñados</small>
                    </div>
                  )}
                </div>
                {formData.Esta_Preniada && formData.Sexo === "F" && (
                  <>
                    <div className="col-md-6">
                      <label htmlFor="fechaMonta" className="form-label">Fecha de Monta</label>
                      <input
                        type="date"
                        className="form-control"
                        id="fechaMonta"
                        value={formData.Fecha_Monta || ''}
                        onChange={(e) => setFormData({ ...formData, Fecha_Monta: e.target.value || null })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label htmlFor="fechaEstimadaParto" className="form-label">Fecha Estimada de Parto</label>
                      <input
                        type="date"
                        className="form-control"
                        id="fechaEstimadaParto"
                        value={formData.Fecha_Estimada_Parto || ''}
                        onChange={(e) => setFormData({ ...formData, Fecha_Estimada_Parto: e.target.value || null })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="modal-footer bg-light">
            <button 
                type="submit" 
                className="btn btn-success"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Guardando...
                  </>
                ) : (
                  <>
                    <span className="me-1">💾</span>
                    {animal ? 'Actualizar' : 'Crear'}
                  </>
                )}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleClose}>
                <span className="me-1">❌</span>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
