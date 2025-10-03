import React, { useState } from 'react';
import { useRoles, useCreateRol, useUpdateRol, useDeleteRol } from '../hooks/useRoles';
import { useToast } from '../hooks/useToast';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { Rol, RolRequest } from '../types/api';

interface RolModalProps {
  rol?: Rol;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RolRequest) => void;
}

function RolModal({ rol, isOpen, onClose, onSave }: RolModalProps) {
  const [formData, setFormData] = useState<RolRequest>({
    Nombre: rol?.Nombre || '',
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
              {rol ? 'Editar Rol' : 'Nuevo Rol'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="nombre" className="form-label">Nombre del Rol</label>
                <input
                  type="text"
                  className="form-control"
                  id="nombre"
                  value={formData.Nombre}
                  onChange={(e) => setFormData({ Nombre: e.target.value })}
                  placeholder="Ej: Administrador, Veterinario, Operador..."
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {rol ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Roles() {
  const { data, isLoading, error } = useRoles();
  const createMutation = useCreateRol();
  const updateMutation = useUpdateRol();
  const deleteMutation = useDeleteRol();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    rol?: Rol;
  }>({ isOpen: false });

  const roles = data?.data || [];

  const openModal = (rol?: Rol) => {
    setModalState({ isOpen: true, rol });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: RolRequest) => {
    try {
      if (modalState.rol) {
        await updateMutation.mutateAsync({
          id: modalState.rol.RolID,
          data: formData
        });
        showToast('Rol actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Rol creado exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el rol';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (rol: Rol) => {
    if (window.confirm(`¿Estás seguro de eliminar el rol "${rol.Nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(rol.RolID);
        showToast('Rol eliminado exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el rol';
        showToast(errorMessage, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los roles</h4>
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
          { label: 'Roles', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Roles</h1>
          <p className="text-muted mb-0">
            Gestiona los roles de usuario en el sistema
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Nuevo Rol
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando roles...</span>
          </div>
        </div>
      ) : roles.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay roles registrados</h5>
            <p className="text-muted">Crea el primer rol para gestionar usuarios.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primer Rol
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
                {roles.map((rol) => (
                  <tr key={rol.RolID}>
                    <td>{rol.RolID}</td>
                    <td className="fw-semibold">{rol.Nombre}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(rol)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(rol)}
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

      <RolModal
        rol={modalState.rol}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
