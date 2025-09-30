import { useState, useEffect } from 'react';
import {
  useHistorial,
  useCreateHistorial,
  useUpdateHistorial,
  useDeleteHistorial
} from '../hooks/useHistorial';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { HistorialVeterinario, HistorialVeterinarioRequest } from '../types/api';

interface HistorialModalProps {
  historial?: HistorialVeterinario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HistorialVeterinarioRequest) => void;
}

const HistorialModal = ({ historial, isOpen, onClose, onSave }: HistorialModalProps) => {
  const { data: animalesData } = useAnimales({});
  const { data: usuariosData } = useUsuarios();

  const animales = animalesData?.data || [];
  const usuarios = usuariosData?.data || [];

  const [formData, setFormData] = useState<HistorialVeterinarioRequest>({
    ID_Animal: historial?.ID_Animal || 0,
    Tipo_Evento: historial?.Tipo_Evento || '',
    Descripcion: historial?.Descripcion || '',
    Fecha_Aplicacion: historial?.Fecha_Aplicacion || '',
    Proxima_Fecha: historial?.Proxima_Fecha || '',
    Hecho_Por: historial?.Hecho_Por || 1
  });

  useEffect(() => {
    if (!historial && animales.length > 0 && formData.ID_Animal === 0) {
      setFormData(prev => ({ ...prev, ID_Animal: animales[0].ID_Animal }));
    }
  }, [animales, historial, formData.ID_Animal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Tipo_Evento.trim() && formData.Descripcion.trim() && formData.ID_Animal > 0) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{historial ? 'Editar Historial' : 'Nuevo Historial'}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                {/* ANIMAL */}
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label">Animal</label>
                  <select
                    className="form-select"
                    id="animal"
                    value={formData.ID_Animal}
                    onChange={e => setFormData({ ...formData, ID_Animal: Number(e.target.value) })}
                    required
                  >
                    {animales.map(animal => (
                      <option key={animal.ID_Animal} value={animal.ID_Animal}>
                        {animal.Nombre} - {animal.CategoriaTipo}
                      </option>
                    ))}
                  </select>
                </div>

                {/* USUARIO */}
                <div className="col-md-6">
                  <label htmlFor="usuario" className="form-label">Realizado por</label>
                  <select
                    className="form-select"
                    id="usuario"
                    value={formData.Hecho_Por}
                    onChange={e => setFormData({ ...formData, Hecho_Por: Number(e.target.value) })}
                    required
                  >
                    {usuarios.map(usuario => (
                      <option key={usuario.ID_Usuario} value={usuario.ID_Usuario}>
                        {usuario.Nombre}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TIPO EVENTO */}
                <div className="col-md-6">
                  <label htmlFor="tipo" className="form-label">Tipo de Evento</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tipo"
                    value={formData.Tipo_Evento}
                    onChange={e => setFormData({ ...formData, Tipo_Evento: e.target.value })}
                    placeholder="Ej: Vacunación, Desparasitación, Tratamiento..."
                    required
                  />
                </div>

                {/* FECHA */}
                <div className="col-md-6">
                  <label htmlFor="fecha" className="form-label">Fecha de Aplicación</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={formData.Fecha_Aplicacion}
                    onChange={e => setFormData({ ...formData, Fecha_Aplicacion: e.target.value })}
                    required
                  />
                </div>

                {/* PROXIMA FECHA */}
                <div className="col-md-6">
                  <label htmlFor="proxima" className="form-label">Próxima Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    id="proxima"
                    value={formData.Proxima_Fecha}
                    onChange={e => setFormData({ ...formData, Proxima_Fecha: e.target.value })}
                  />
                </div>

                {/* DESCRIPCIÓN */}
                <div className="col-12">
                  <label htmlFor="descripcion" className="form-label">Descripción</label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    rows={3}
                    value={formData.Descripcion}
                    onChange={e => setFormData({ ...formData, Descripcion: e.target.value })}
                    placeholder="Descripción detallada del evento..."
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary">{historial ? 'Actualizar' : 'Crear'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export function Historial() {
  const [page, setPage] = useState<number>(Number(localStorage.getItem('historialPage')) || 1);
  const [limit, setLimit] = useState<number>(Number(localStorage.getItem('historialLimit')) || 10);

  const { data, isLoading } = useHistorial({ page, limit });
  const createMutation = useCreateHistorial();
  const updateMutation = useUpdateHistorial();
  const deleteMutation = useDeleteHistorial();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{ isOpen: boolean; historial?: HistorialVeterinario }>({ isOpen: false });

  const historial: HistorialVeterinario[] = Array.isArray(data?.data) ? data.data : [];
  const pagination = data?.pagination;

  const openModal = (historial?: HistorialVeterinario) => setModalState({ isOpen: true, historial });
  const closeModal = () => setModalState({ isOpen: false });

  const handleDelete = async (item: HistorialVeterinario) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento?')) {
      try {
        await deleteMutation.mutateAsync(item.ID_Evento);
        showToast('Historial eliminado exitosamente', 'success');
      } catch {
        showToast('Error al eliminar el historial', 'error');
      }
    }
  };

  const handleSave = async (formData: HistorialVeterinarioRequest) => {
    try {
      if (modalState.historial) {
        await updateMutation.mutateAsync({ id: modalState.historial.ID_Evento, data: formData });
        showToast('Historial actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Historial creado exitosamente', 'success');
      }
      closeModal();
    } catch {
      showToast('Error al guardar el historial', 'error');
    }
  };

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Gestión', path: '#' },
          { label: 'Historial Médico', active: true }
        ]}
      />

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Historial Veterinario</h1>
          <p className="text-muted mb-0">{isLoading ? 'Cargando...' : `${historial.length} eventos registrados`}</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>Nuevo Evento</button>
      </div>

      {/* Tabla */}
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
            <button className="btn btn-primary" onClick={() => openModal()}>Crear Primer Evento</button>
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
                {historial.map(item => (
                  <tr key={item.ID_Evento}>
                    <td className="fw-semibold">{item.AnimalNombre}</td>
                    <td><span className="badge bg-info">{item.Tipo_Evento}</span></td>
                    <td>{item.Descripcion}</td>
                    <td>{new Date(item.Fecha_Aplicacion).toLocaleDateString()}</td>
                    <td>{item.Proxima_Fecha ? new Date(item.Proxima_Fecha).toLocaleDateString() : '-'}</td>
                    <td>{item.UsuarioNombre}</td>
                    <td>
                      <div className="btn-group" role="group">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => openModal(item)}>Editar</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(item)} disabled={deleteMutation.isPending}>Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {pagination && (
        <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
          <div>
            <label className="me-2">Ver:</label>
            <select
              className="form-select d-inline-block w-auto"
              value={limit}
              onChange={e => { setLimit(Number(e.target.value)); localStorage.setItem('historialLimit', e.target.value); setPage(1); }}
              style={{ minWidth: 70 }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span className="ms-2">por página</span>
          </div>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item${!pagination.hasPrevPage ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(1)} disabled={!pagination.hasPrevPage}>&laquo;</button>
              </li>
              <li className={`page-item${!pagination.hasPrevPage ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page - 1)} disabled={!pagination.hasPrevPage}>&lsaquo;</button>
              </li>
              <li className="page-item disabled">
                <span className="page-link">Página {pagination.currentPage} de {pagination.totalPages}</span>
              </li>
              <li className={`page-item${!pagination.hasNextPage ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(page + 1)} disabled={!pagination.hasNextPage}>&rsaquo;</button>
              </li>
              <li className={`page-item${!pagination.hasNextPage ? ' disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(pagination.totalPages)} disabled={!pagination.hasNextPage}>&raquo;</button>
              </li>
            </ul>
          </nav>
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
