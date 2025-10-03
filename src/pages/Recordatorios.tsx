// Extender el tipo Window para refetchRecordatorios
declare global {
  interface Window {
    refetchRecordatorios?: () => void;
  }
}
// Extender el tipo Window para fetchAutoRecordatorios
declare global {
  interface Window {
    fetchAutoRecordatorios?: () => void;
  }
}

import { useState, useEffect, useMemo } from 'react';
import { useRecordatorios, useCreateRecordatorio, useUpdateRecordatorio, useDeleteRecordatorio } from '../hooks/useRecordatorios';
import http from '../api/http';
import { useAnimales } from '../hooks/useAnimales';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../context/ToastContext';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { RecordatoriosFilters, Recordatorio, RecordatorioRequest } from '../types/api';

interface RecordatorioModalProps {
  recordatorio?: Recordatorio;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecordatorioRequest) => void;
}

function RecordatorioModal({ recordatorio, isOpen, onClose, onSave }: RecordatorioModalProps) {
  // Mostrar todos los animales sin filtro
  const { data: animalesData } = useAnimales({});
  // Solo mostrar animales en estado 'viva'
  const animales = useMemo(() => (animalesData?.data || []).filter(a => a.EstadoNombre?.toLowerCase() === 'viva'), [animalesData?.data]);

  const [formData, setFormData] = useState<RecordatorioRequest>({
    ID_Animal: recordatorio?.ID_Animal || 0,
    Titulo: recordatorio?.Titulo || '',
    Descripcion: recordatorio?.Descripcion || '',
    Fecha_Recordatorio: recordatorio?.Fecha_Recordatorio || '',
  });

  // Update ID_Animal when animals are loaded and no recordatorio is being edited
  useEffect(() => {
    if (!recordatorio && animales.length > 0 && formData.ID_Animal === 0) {
      setFormData(prev => ({
        ...prev,
        ID_Animal: animales[0].ID_Animal
      }));
    }
  }, [animales, recordatorio, formData.ID_Animal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Titulo.trim() && formData.Descripcion.trim() && formData.ID_Animal > 0) {
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
              {recordatorio ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
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
                    value={formData.ID_Animal ?? ""}
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
                  <label htmlFor="fecha" className="form-label">Fecha Recordatorio</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fecha"
                    value={formData.Fecha_Recordatorio}
                    onChange={(e) => setFormData({ ...formData, Fecha_Recordatorio: e.target.value })}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="titulo" className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    value={formData.Titulo}
                    onChange={(e) => setFormData({ ...formData, Titulo: e.target.value })}
                    placeholder="Ej: Vacuna Triple, Desparasitación..."
                    required
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
                    placeholder="Descripción detallada del recordatorio..."
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
                {recordatorio ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Recordatorios() {
  // Filtro de estado: '' (todos), 'pendiente', 'hecho'
  const [estadoFiltro, setEstadoFiltro] = useState<'' | 'pendiente' | 'hecho'>('');
  const [page, setPage] = useState<number>(() => Number(localStorage.getItem('recordatoriosPage')) || 1);
  const [limit, setLimit] = useState<number>(() => Number(localStorage.getItem('recordatoriosLimit')) || 10);
  const { params } = useQueryParams<RecordatoriosFilters>();
  const { data, isLoading, error, refetch } = useRecordatorios({ ...params, Estado: estadoFiltro || undefined, page, limit });
  // El resultado de useRecordatorios es PaginatedResponse<Recordatorio>
  const recordatorios: Recordatorio[] = Array.isArray(data?.data) ? data?.data : [];
  const pagination = data?.pagination;
  // Acción para cambiar estado
  const handleChangeEstado = async (recordatorio: Recordatorio, nuevoEstado: 'pendiente' | 'hecho') => {
    try {
      await http.patch(`/recordatorios/${recordatorio.ID_Recordatorio}/estado`, { estado: nuevoEstado });
      showToast(`Recordatorio marcado como ${nuevoEstado === 'hecho' ? 'realizado' : 'pendiente'}`, 'success');
      refetch();
      // Refrescar contador de notificaciones, reintentando si la función aún no está lista
      const tryUpdateNotificationCount = (retries = 5) => {
        if (window.updateNotificationCount) {
          window.updateNotificationCount();
        } else if (retries > 0) {
          setTimeout(() => tryUpdateNotificationCount(retries - 1), 200);
        }
      };
      tryUpdateNotificationCount();
    } catch (error: any) {
      showToast('Error al cambiar el estado', 'error');
    }
  };
  // Exponer función global para forzar refetch de la tabla desde otros módulos
  useEffect(() => {
    window.refetchRecordatorios = refetch;
    return () => {
      delete window.refetchRecordatorios;
    };
  }, [refetch]);
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);
  const createMutation = useCreateRecordatorio();
  const updateMutation = useUpdateRecordatorio();
  const deleteMutation = useDeleteRecordatorio();
  const { showToast } = useToast();

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    recordatorio?: Recordatorio;
  }>({ isOpen: false });


  // ...ya definido arriba
  // Guardar selección de página y límite
  useEffect(() => {
    localStorage.setItem('recordatoriosPage', String(page));
  }, [page]);
  useEffect(() => {
    localStorage.setItem('recordatoriosLimit', String(limit));
    setPage(1); // Volver a la primera página al cambiar el límite
  }, [limit]);

  const openModal = (recordatorio?: Recordatorio) => {
    setModalState({ isOpen: true, recordatorio });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleSave = async (formData: RecordatorioRequest) => {
    try {
      if (modalState.recordatorio) {
        await updateMutation.mutateAsync({
          id: modalState.recordatorio.ID_Recordatorio,
          data: formData
        });
        showToast('Recordatorio actualizado exitosamente', 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast('Recordatorio creado exitosamente', 'success');
      }
      closeModal();
      // Refrescar tabla y contador de notificaciones inmediatamente
      refetch();
      // Refrescar contador de notificaciones, reintentando si la función aún no está lista
      const tryUpdateNotificationCount2 = (retries = 5) => {
        if (window.updateNotificationCount) {
          window.updateNotificationCount();
        } else if (retries > 0) {
          setTimeout(() => tryUpdateNotificationCount2(retries - 1), 200);
        }
      };
      tryUpdateNotificationCount2();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el recordatorio';
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (recordatorio: Recordatorio) => {
    if (window.confirm(`¿Estás seguro de eliminar el recordatorio "${recordatorio.Titulo}"?`)) {
      try {
        await deleteMutation.mutateAsync(recordatorio.ID_Recordatorio);
        showToast('Recordatorio eliminado exitosamente', 'success');
        // Refrescar tabla y contador de notificaciones inmediatamente
        refetch();
        // Refrescar contador de notificaciones, reintentando si la función aún no está lista
        const tryUpdateNotificationCount3 = (retries = 5) => {
          if (window.updateNotificationCount) {
            window.updateNotificationCount();
          } else if (retries > 0) {
            setTimeout(() => tryUpdateNotificationCount3(retries - 1), 200);
          }
        };
        tryUpdateNotificationCount3();
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el recordatorio';
        showToast(errorMessage, 'error');
      }
    }
  };


  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los recordatorios</h4>
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
          { label: 'Gestión', path: '#' },
          { label: 'Recordatorios', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Recordatorios</h1>
          <p className="text-muted mb-0">
            {isLoading ? 'Cargando...' : `${recordatorios.length} recordatorios registrados`}
          </p>
        </div>
        <div className="d-flex gap-2">
          {/* Botón de filtros eliminado por solicitud */}
          <button className="btn btn-primary" onClick={() => openModal()}>
            Nuevo Recordatorio
          </button>
        </div>
      </div>

      {/* Filtro de estado */}
      <div className="mb-3">
        <div className="btn-group" role="group" aria-label="Filtro estado">
          <button className={`btn btn-sm ${estadoFiltro === '' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setEstadoFiltro('')}>Todos</button>
          <button className={`btn btn-sm ${estadoFiltro === 'pendiente' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setEstadoFiltro('pendiente')}>Pendientes</button>
          <button className={`btn btn-sm ${estadoFiltro === 'hecho' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setEstadoFiltro('hecho')}>Realizados</button>
        </div>
      </div>


      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando recordatorios...</span>
          </div>
        </div>
  ) : recordatorios.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No hay recordatorios registrados</h5>
            <p className="text-muted">Crea el primer recordatorio para gestionar tareas.</p>
            <button className="btn btn-primary" onClick={() => openModal()}>
              Crear Primer Recordatorio
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Título</th>
                  <th>Animal</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {recordatorios.map((recordatorio: Recordatorio) => (
                  <tr key={recordatorio.ID_Recordatorio}>
                    <td className="fw-semibold">{recordatorio.Titulo}</td>
                    <td>{recordatorio.AnimalNombre}</td>
                    <td>{recordatorio.Descripcion}</td>
                    <td>{new Date(recordatorio.Fecha_Recordatorio).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${recordatorio.Estado === 'hecho' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {recordatorio.Estado === 'hecho' ? 'Realizado' : 'Pendiente'}
                      </span>
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        {recordatorio.Estado === 'pendiente' ? (
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => handleChangeEstado(recordatorio, 'hecho')}
                          >
                            Realizado
                          </button>
                        ) : (
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => handleChangeEstado(recordatorio, 'pendiente')}
                          >
                            Pendiente
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(recordatorio)}
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

      {/* Paginación y cantidad por página abajo de la tabla */}
      <div className="d-flex justify-content-between align-items-center mt-3 mb-2">
        <div>
          <label className="me-2">Ver:</label>
          <select
            className="form-select d-inline-block w-auto"
            value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            style={{ minWidth: 70 }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
          <span className="ms-2">por página</span>
        </div>
        {pagination && (
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
        )}
      </div>

      <RecordatorioModal
        recordatorio={modalState.recordatorio}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />
    </div>
  );
}
