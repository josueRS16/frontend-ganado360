import { useState, useEffect } from 'react';
import { useDarDeBajaAnimal } from '../../hooks/useEstadoAnimal';
import { useToast } from '../../context/ToastContext';
import type { Animal } from '../../types/api';

interface DarDeBajaModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DarDeBajaModal({ animal, isOpen, onClose, onSuccess }: DarDeBajaModalProps) {
  const [fechaFallecimiento, setFechaFallecimiento] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const darDeBajaMutation = useDarDeBajaAnimal();
  const { showToast } = useToast();

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFechaFallecimiento('');
      setIsSubmitting(false);
    }
  }, [isOpen, animal]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!animal) {
      showToast('Error: No se ha seleccionado un animal', 'error');
      return;
    }

    if (!animal.ID_Estado_Animal) {
      showToast('No se puede dar de baja: el animal no tiene un estado asignado', 'error');
      return;
    }

    if (!fechaFallecimiento) {
      showToast('Debe ingresar la fecha de fallecimiento', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Aquí enviaremos tanto el ID_Estado_Animal como la fecha de fallecimiento
      await darDeBajaMutation.mutateAsync({
        idEstadoAnimal: animal.ID_Estado_Animal,
        fechaFallecimiento: fechaFallecimiento
      });
      
      showToast(
        `Animal "${animal.Nombre}" dado de baja exitosamente`, 
        'success'
      );
      
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al dar de baja el animal';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="modal show d-block" 
      tabIndex={-1} 
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-arrow-down-circle me-2"></i>
              Dar de Baja Animal
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={handleClose}
              disabled={isSubmitting}
              aria-label="Cerrar modal"
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Información del Animal */}
              <div className="alert alert-warning border-0 mb-4">
                <div className="d-flex align-items-center">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  <div>
                    <h6 className="mb-1 fw-semibold">¡Atención!</h6>
                    <p className="mb-0">
                      Esta acción dará de baja al animal de forma permanente.
                    </p>
                  </div>
                </div>
              </div>

              <div className="alert alert-light border-0 mb-4" style={{ backgroundColor: 'var(--color-sage-gray)' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--color-base-green)' }}></i>
                  <div>
                    <h6 className="mb-1 fw-semibold">Animal a dar de baja:</h6>
                    <p className="mb-0" style={{ color: 'var(--color-charcoal)' }}>
                      <strong>{animal?.Nombre}</strong> - {animal?.CategoriaTipo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fecha de Fallecimiento */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Fecha de Fallecimiento <span className="text-danger">*</span>
                </label>
                <input
                  type="date"
                  className="form-control"
                  value={fechaFallecimiento}
                  onChange={(e) => setFechaFallecimiento(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
                  disabled={isSubmitting}
                  required
                />
                <div className="form-text">
                  <i className="bi bi-info-circle me-1"></i>
                  La fecha no puede ser posterior al día de hoy
                </div>
              </div>

              {/* Confirmación visual */}
              {fechaFallecimiento && (
                <div className="alert alert-danger border-0">
                  <div className="d-flex align-items-center">
                    <i className="bi bi-calendar-x me-2"></i>
                    <div>
                      <strong>Fecha de fallecimiento:</strong> {new Date(fechaFallecimiento).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer bg-light border-0 p-3">
              <div className="d-flex justify-content-end gap-2 w-100">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-danger"
                  disabled={!fechaFallecimiento || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Dando de baja...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-arrow-down-circle me-2"></i>
                      Confirmar Baja
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


