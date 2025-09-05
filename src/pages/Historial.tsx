import { useState } from 'react';
import { useHistorial, useCreateHistorial, useUpdateHistorial, useDeleteHistorial } from '../hooks/useHistorial';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useToast } from '../context/ToastContext';
import type { HistorialVeterinario, HistorialVeterinarioRequest } from '../types/api';

interface HistorialModalProps {
  historial?: HistorialVeterinario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HistorialVeterinarioRequest) => void;
}

function HistorialModal({ historial, isOpen, onClose, onSave }: HistorialModalProps) {
  const { data: animalesData } = useAnimales();
  const { data: usuariosData } = useUsuarios();
  const animales = animalesData?.data || [];
  const usuarios = usuariosData?.data || [];

  const [formData, setFormData] = useState<HistorialVeterinarioRequest>({
    ID_Animal: historial?.ID_Animal || 1,
    Tipo_Evento: historial?.Tipo_Evento || '',
    Descripcion: historial?.Descripcion || '',
    Fecha_Aplicacion: historial?.Fecha_Aplicacion || '',
    Proxima_Fecha: historial?.Proxima_Fecha || '',
    Hecho_Por: historial?.Hecho_Por || 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Tipo_Evento.trim() && formData.Descripcion.trim()) {
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
              {historial ? 'Editar Historial' : 'Nuevo Historial'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label">Animal</label>
                  <select
                    className="form-select"
                    id="animal"
                    value={formData.ID_Animal}
                    onChange={(e) => setFormData({ ...formData, ID_Animal: Number(e.target.value) })}
                    required
                  >
                    {animales.map(animal => (
                      <option key={animal.ID_Animal} value={animal.ID_Animal}>
                        {animal.Nombre} - {animal.CategoriaTipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="usuario" className="form-label">Realizado por</label>
                  <select
                    className="form-select"
                    id="usuario"
                    value={formData.Hecho_Por}
                    onChange={(e) => setFormData({ ...formData, Hecho_Por: Number(e.target.value) })}
                    required
                  >
                    {usuarios.map(usuario => (
                      <option key={usuario.ID_Usuario} value={usuario.ID_Usuario}>
                        {usuario.Nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label htmlFor="tipo" className="form-label">Tipo de Evento</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tipo"
                    value={formData.Tipo_Evento}
                    onChange={(e) => setFormData({ ...formData, Tipo_Evento: e.target.value })}
                    placeholder="Ej: Vacunación, Desparasitación, Tratamiento..."
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="fecha" className="form-label">Fecha de Aplicación</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={formData.Fecha_Aplicacion}
                    onChange={(e) => setFormData({ ...formData, Fecha_Aplicacion: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label htmlFor="proxima" className="form-label">Próxima Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="proxima"
                    value={formData.Proxima_Fecha}
                    onChange={(e) => setFormData({ ...formData, Proxima_Fecha: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="descripcion" className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    rows={3}
                    value={formData.Descripcion}
                    onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                    placeholder="Descripción detallada del evento..."
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                {historial ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Historial() {
  const { data, isLoading, error } = useHistorial();
  const createMutation = useCreateHistorial();
  const updateMutation = useUpdateHistorial();
  const deleteMutation = useDeleteHistorial();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    historial?: HistorialVeterinario;
  }>({ isOpen: false });

  const historial = data?.data || [];

  const openModal = (historial?: HistorialVeterinario) => {
    setModalState({ isOpen: true, historial });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: HistorialVeterinarioRequest) => {
    try {
      if (modalState.historial) {
        await updateMutation.mutateAsync({
          id: modalState.historial.ID_Evento,
          data: formData
        });
        showToast('Historial actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Historial creado exitosamente', 'success');
      }
      closeModal();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el historial';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (historial: HistorialVeterinario) => {
    if (window.confirm(`¿Estás seguro de eliminar el evento "${historial.Tipo_Evento}"?`)) {
      try {
        await deleteMutation.mutateAsync(historial.ID_Evento);
        showToast('Historial eliminado exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el historial';
        showToast(errorMessage, 'error');
      }
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar el historial</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Historial Veterinario</h1>
          <p className="text-muted mb-0">
            {isLoading ? 'Cargando...' : `${historial.length} eventos registrados`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          Nuevo Evento
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando historial...</span>
          </div>
        </div>
      ) : historial.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay eventos registrados</h5>
            <p className="text-muted">Crea el primer evento del historial veterinario.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primer Evento
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Animal</th>
                  <th>Tipo de Evento</th>
                  <th>Descripción</th>
                  <th>Fecha Aplicación</th>
                  <th>Próxima Fecha</th>
                  <th>Realizado por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.map((item) => (
                  <tr key={item.ID_Evento}>
                    <td className="fw-semibold">{item.AnimalNombre}</td>
                    <td>
                      <span className="badge bg-info">{item.Tipo_Evento}</span>
                    </td>
                    <td>{item.Descripcion}</td>
                    <td>{new Date(item.Fecha_Aplicacion).toLocaleDateString()}</td>
                    <td>{item.Proxima_Fecha ? new Date(item.Proxima_Fecha).toLocaleDateString() : '-'}</td>
                    <td>{item.UsuarioNombre}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => openModal(item)}
                        >
                          Editar
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(item)}
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

      <HistorialModal
        historial={modalState.historial}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
