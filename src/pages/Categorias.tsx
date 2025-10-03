import React, { useState, useEffect } from 'react';
import { useCategorias, useCreateCategoria, useUpdateCategoria, useDeleteCategoria } from '../hooks/useCategorias';
import { useToast } from '../hooks/useToast';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { Categoria, CategoriaRequest, UpdateCategoriaRequest } from '../types/api';

interface CategoriaModalProps {
  categoria?: Categoria;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoriaRequest | UpdateCategoriaRequest, isEdit: boolean) => void;
}

// Helper function to create initial form data
const createInitialFormData = (categoria?: Categoria): CategoriaRequest => ({
  Tipo: categoria?.Tipo || '',
});

function CategoriaModal({ categoria, isOpen, onClose, onSave }: CategoriaModalProps) {
  const [formData, setFormData] = useState<CategoriaRequest>(createInitialFormData(categoria));

  // Update form data when categoria prop changes
  useEffect(() => {
    setFormData(createInitialFormData(categoria));
  }, [categoria]);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData(createInitialFormData());
    onClose();
  };

  const handleCreateCategoria = async () => {
    onSave(formData, false);
  };

  const handleUpdateCategoria = async () => {
    if (!categoria) throw new Error('No se puede actualizar: categoría no especificada');
    onSave(formData, true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Tipo.trim()) {
      if (categoria) {
        handleUpdateCategoria();
      } else {
        handleCreateCategoria();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {categoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="tipo" className="form-label">Tipo de Categoría</label>
                <input
                  type="text"
                  className="form-control"
                  id="tipo"
                  value={formData.Tipo}
                  onChange={(e) => setFormData({ Tipo: e.target.value })}
                  placeholder="Ej: Bovino, Porcino, Ovino..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {categoria ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Categorias() {
  const { data, isLoading, error } = useCategorias();
  const createMutation = useCreateCategoria();
  const updateMutation = useUpdateCategoria();
  const deleteMutation = useDeleteCategoria();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    categoria?: Categoria;
  }>({ isOpen: false });

  const categorias = data?.data || [];

  const openModal = (categoria?: Categoria) => {
    setModalState({ isOpen: true, categoria });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: CategoriaRequest | UpdateCategoriaRequest, isEdit: boolean) => {
    try {
      if (isEdit && modalState.categoria) {
        await updateMutation.mutateAsync({
          id: modalState.categoria.ID_Categoria,
          data: formData as UpdateCategoriaRequest
        });
        showToast('Categoría actualizada exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData as CategoriaRequest);
        showToast('Categoría creada exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la categoría';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (categoria: Categoria) => {
    if (window.confirm(`¿Estás seguro de eliminar la categoría "${categoria.Tipo}"?`)) {
      try {
        await deleteMutation.mutateAsync(categoria.ID_Categoria);
        showToast('Categoría eliminada exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar la categoría';
        showToast(errorMessage, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar las categorías</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Configuración', path: '#' },
          { label: 'Categorías', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Categorías</h1>
          <p className="text-muted mb-0">
            Gestiona los tipos de ganado en el sistema
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Nueva Categoría
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando categorías...</span>
          </div>
        </div>
      ) : categorias.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay categorías registradas</h5>
            <p className="text-muted">Crea la primera categoría para clasificar el ganado.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primera Categoría
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
                  <th>Tipo</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr key={categoria.ID_Categoria}>
                    <td>{categoria.ID_Categoria}</td>
                    <td className="fw-semibold">{categoria.Tipo}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(categoria)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(categoria)}
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

      <CategoriaModal
        categoria={modalState.categoria}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
