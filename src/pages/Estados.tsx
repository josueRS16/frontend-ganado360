import { useState } from 'react';
import { useEstados, useCreateEstado, useUpdateEstado, useDeleteEstado } from '../hooks/useEstados';
import { useToast } from '../context/ToastContext';
import type { Estado, EstadoRequest } from '../types/api';

interface EstadoModalProps {
  estado?: Estado;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: EstadoRequest) => void;
}

function EstadoModal({ estado, isOpen, onClose, onSave }: EstadoModalProps) {
  const [formData, setFormData] = useState<EstadoRequest>({
    Nombre: estado?.Nombre || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Nombre.trim()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {estado ? 'Editar Estado' : 'Nuevo Estado'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre del Estado</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({ Nombre: e.target.value })}
                  placeholder="Ej: Activo, Inactivo, Vendido..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {estado ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Estados() {
  const { data, isLoading, error } = useEstados();
  const createMutation = useCreateEstado();
  const updateMutation = useUpdateEstado();
  const deleteMutation = useDeleteEstado();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    estado?: Estado;
  }>({ isOpen: false });

  const estados = data?.data || [];

  const openModal = (estado?: Estado) => {
    setModalState({ isOpen: true, estado });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: EstadoRequest) => {
    try {
      if (modalState.estado) {
        await updateMutation.mutateAsync({
          id: modalState.estado.ID_Estado,
          data: formData
        });
        showToast('Estado actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Estado creado exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el estado';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (estado: Estado) => {
    if (window.confirm(`¿Estás seguro de eliminar el estado "${estado.Nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(estado.ID_Estado);
        showToast('Estado eliminado exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el estado';
        showToast(errorMessage, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los estados</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Estados</h1>
          <p className="text-muted mb-0">
            Gestiona los estados del ganado
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Nuevo Estado
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando estados...</span>
          </div>
        </div>
      ) : estados.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay estados registrados</h5>
            <p className="text-muted">Crea el primer estado para clasificar el ganado.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primer Estado
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estados.map((estado) => (
                  <tr key={estado.ID_Estado}>
                    <td>{estado.ID_Estado}</td>
                    <td className="fw-semibold">{estado.Nombre}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(estado)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(estado)}
                          disabled={deleteMutation.isPending}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EstadoModal
        estado={modalState.estado}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
