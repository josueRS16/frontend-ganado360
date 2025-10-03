import { useState } from 'react';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '../hooks/useUsuarios';
import { useRoles } from '../hooks/useRoles';
import { useToast } from '../hooks/useToast';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { Usuario, UsuarioRequest } from '../types/api';

interface UsuarioModalProps {
  usuario?: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UsuarioRequest) => void;
}

function UsuarioModal({ usuario, isOpen, onClose, onSave }: UsuarioModalProps) {
  const { data: rolesData } = useRoles();
  const roles = rolesData?.data || [];

  const [formData, setFormData] = useState<UsuarioRequest>({
    Nombre: usuario?.Nombre || '',
    Correo: usuario?.Correo || '',
    Contraseña: '',
    RolID: usuario?.RolID || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Nombre.trim() && formData.Correo.trim()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
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
                  <label htmlFor="correo" className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    id="correo"
                    value={formData.Correo}
                    onChange={(e) => setFormData({ ...formData, Correo: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="contraseña" className="form-label">
                    Contraseña {usuario && <small className="text-muted">(dejar vacío para no cambiar)</small>}
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="contraseña"
                    value={formData.Contraseña}
                    onChange={(e) => setFormData({ ...formData, Contraseña: e.target.value })}
                    required={!usuario}
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="rol" className="form-label">Rol</label>
                  <select
                    className="form-select"
                    id="rol"
                    value={formData.RolID}
                    onChange={(e) => setFormData({ ...formData, RolID: Number(e.target.value) })}
                    required
                  >
                    {roles.map(rol => (
                      <option key={rol.RolID} value={rol.RolID}>
                        {rol.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {usuario ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Usuarios() {
  const { data, isLoading, error } = useUsuarios();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    usuario?: Usuario;
  }>({ isOpen: false });

  const usuarios = data?.data || [];

  const openModal = (usuario?: Usuario) => {
    setModalState({ isOpen: true, usuario });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: UsuarioRequest) => {
    try {
      if (modalState.usuario) {
        await updateMutation.mutateAsync({
          id: modalState.usuario.ID_Usuario,
          data: formData
        });
        showToast('Usuario actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Usuario creado exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el usuario';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    if (window.confirm(`¿Estás seguro de eliminar el usuario "${usuario.Nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(usuario.ID_Usuario);
        showToast('Usuario eliminado exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el usuario';
        showToast(errorMessage, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los usuarios</h4>
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
          { label: 'Usuarios', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Usuarios</h1>
          <p className="text-muted mb-0">
            Gestiona los usuarios del sistema
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Nuevo Usuario
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando usuarios...</span>
          </div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay usuarios registrados</h5>
            <p className="text-muted">Crea el primer usuario para gestionar el sistema.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primer Usuario
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
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Fecha Creación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.ID_Usuario}>
                    <td>{usuario.ID_Usuario}</td>
                    <td className="fw-semibold">{usuario.Nombre}</td>
                    <td>{usuario.Correo}</td>
                    <td>
                      <span className="badge bg-secondary">{usuario.RolNombre}</span>
                    </td>
                    <td>{new Date(usuario.Creado_En).toLocaleDateString()}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(usuario)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(usuario)}
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

      <UsuarioModal
        usuario={modalState.usuario}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
