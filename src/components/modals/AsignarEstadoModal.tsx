import { useState, useEffect } from 'react';
import { useEstados } from '../../hooks/useEstados';
import { useCreateEstadoAnimal } from '../../hooks/useEstadoAnimal';
import { useToast } from '../../hooks/useToast';
import type { Animal, EstadoAnimalRequest } from '../../types/api';
import '../../styles/modal-estados.css';

interface AsignarEstadoModalProps {
  animal: Animal | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AsignarEstadoModal({ animal, isOpen, onClose, onSuccess }: AsignarEstadoModalProps) {
  const [selectedEstadoId, setSelectedEstadoId] = useState<number | null>(null);
  const [fechaFallecimiento, setFechaFallecimiento] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: estadosData, isLoading: loadingEstados } = useEstados();
  const createMutation = useCreateEstadoAnimal();
  const { showToast } = useToast();

  const estados = estadosData?.data || [];
  const selectedEstado = estados.find(e => e.ID_Estado === selectedEstadoId);
  const isMuertaState = selectedEstado?.Nombre?.toLowerCase() === 'baja' || selectedEstado?.ID_Estado === 10;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedEstadoId(null);
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
    
    if (!animal || !selectedEstadoId) {
      showToast('Debe seleccionar un estado', 'error');
      return;
    }

    if (isMuertaState && !fechaFallecimiento) {
      showToast('Debe ingresar la fecha de fallecimiento', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: EstadoAnimalRequest = {
        ID_Animal: animal.ID_Animal,
        ID_Estado: selectedEstadoId,
        Fecha_Fallecimiento: isMuertaState ? fechaFallecimiento : null,
      };

      await createMutation.mutateAsync(payload);
      
      showToast(
        `Estado "${selectedEstado?.Nombre}" asignado exitosamente a ${animal.Nombre}`, 
        'success'
      );
      
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al asignar el estado';
      showToast(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstadoSelect = (estadoId: number) => {
    setSelectedEstadoId(estadoId);
    // Limpiar fecha si no es estado "Muerta"
    const estado = estados.find(e => e.ID_Estado === estadoId);
    const isMuerta = estado?.Nombre?.toLowerCase() === 'baja' || estado?.ID_Estado === 10;
    if (!isMuerta) {
      setFechaFallecimiento('');
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
              <i className="bi bi-tags me-2"></i>
              Asignar Estado
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
              <div className="alert alert-light border-0 mb-4" style={{ backgroundColor: 'var(--color-sage-gray)' }}>
                <div className="d-flex align-items-center">
                  <i className="bi bi-info-circle-fill me-2" style={{ color: 'var(--color-base-green)' }}></i>
                  <div>
                    <h6 className="mb-1 fw-semibold">Animal seleccionado:</h6>
                    <p className="mb-0" style={{ color: 'var(--color-charcoal)' }}>
                      <strong>{animal?.Nombre}</strong> - {animal?.CategoriaTipo}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selección de Estado */}
              <div className="mb-4">
                <label className="form-label fw-semibold">
                  Estado a asignar <span className="text-danger">*</span>
                </label>
                
                {loadingEstados ? (
                  <div className="d-flex justify-content-center py-3">
                    <div className="spinner-border spinner-border-sm" style={{ color: 'var(--color-base-green)' }} role="status">
                      <span className="visually-hidden">Cargando estados...</span>
                    </div>
                  </div>
                ) : (
                  <div className="row g-2">
                    {estados.map((estado) => (
                      <div key={estado.ID_Estado} className="col-12 col-sm-6">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="estado"
                            id={`estado-${estado.ID_Estado}`}
                            value={estado.ID_Estado}
                            checked={selectedEstadoId === estado.ID_Estado}
                            onChange={() => handleEstadoSelect(estado.ID_Estado)}
                            disabled={isSubmitting}
                          />
                          <label 
                            className="form-check-label fw-medium w-100" 
                            htmlFor={`estado-${estado.ID_Estado}`}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="d-flex justify-content-between align-items-center p-2 border rounded hover-bg-light">
                              <span>{estado.Nombre}</span>
                              {(estado.Nombre?.toLowerCase() === 'baja' || estado.ID_Estado === 10) && (
                                <i className="bi bi-exclamation-triangle text-warning" title="Requiere fecha de fallecimiento"></i>
                              )}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Fecha de Fallecimiento (solo para estado "Muerta") */}
              {isMuertaState && (
                <div className="mb-3">
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
                    La fecha no puede ser posterior al día de hoy
                  </div>
                </div>
              )}

              {/* Estado seleccionado */}
              {selectedEstado && (
                <div className="alert alert-success border-0 mb-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      <span>Estado seleccionado: <strong>{selectedEstado.Nombre}</strong></span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedEstadoId(null)}
                      disabled={isSubmitting}
                      title="Cambiar selección"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
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
                  className="btn btn-apply"
                  disabled={!selectedEstadoId || isSubmitting || (isMuertaState && !fechaFallecimiento)}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Asignando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Asignar Estado
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
