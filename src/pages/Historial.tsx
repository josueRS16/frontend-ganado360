import { useState, useEffect, useMemo } from 'react';
import {
  useHistorial,
  useCreateHistorial,
  useUpdateHistorial,
  useDeleteHistorial
} from '../hooks/useHistorial';
import { useAnimales } from '../hooks/useAnimales';
import { useUsuarios } from '../hooks/useUsuarios';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../hooks/useAuth';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Pagination } from '../components/ui/Pagination';
import type { HistorialVeterinario, HistorialVeterinarioRequest, HistorialFilters } from '../types/api';

interface HistorialModalProps {
  historial?: HistorialVeterinario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: HistorialVeterinarioRequest) => void;
}

const HistorialModal = ({ historial, isOpen, onClose, onSave }: HistorialModalProps) => {
  const { data: animalesData } = useAnimales({});
  const { user } = useAuth();

  // Solo mostrar animales en estado 'Viva'
  const animales = useMemo(() => 
    (animalesData?.data || []).filter(a => a.EstadoNombre?.toLowerCase() === 'viva'),
    [animalesData?.data]
  );

  // Función para limpiar el formulario
  const resetForm = () => {
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      ID_Animal: animales.length > 0 ? animales[0].ID_Animal : 0,
      Tipo_Evento: '',
      Descripcion: '',
      Fecha_Aplicacion: today,
      Proxima_Fecha: '',
      Hecho_Por: user?.ID_Usuario || 1 // Usar el ID del usuario actual
    });
  };

  // Función para cargar datos del historial
  const loadHistorialData = (historialData: HistorialVeterinario) => {
    setFormData({
      ID_Animal: historialData.ID_Animal,
      Tipo_Evento: historialData.Tipo_Evento,
      Descripcion: historialData.Descripcion,
      Fecha_Aplicacion: historialData.Fecha_Aplicacion,
      Proxima_Fecha: historialData.Proxima_Fecha,
      Hecho_Por: historialData.Hecho_Por
    });
  };

  const [formData, setFormData] = useState<HistorialVeterinarioRequest>(() => {
  const today = new Date().toISOString().slice(0, 10);
    if (historial) {
      return {
        ID_Animal: historial.ID_Animal,
        Tipo_Evento: historial.Tipo_Evento,
        Descripcion: historial.Descripcion,
        Fecha_Aplicacion: historial.Fecha_Aplicacion,
        Proxima_Fecha: historial.Proxima_Fecha,
        Hecho_Por: historial.Hecho_Por
      };
    } else {
      return {
        ID_Animal: 0,
        Tipo_Evento: '',
        Descripcion: '',
        Fecha_Aplicacion: today,
        Proxima_Fecha: '',
        Hecho_Por: user?.ID_Usuario || 1 // Usar el ID del usuario actual
      };
    }
  });

  // Actualizar el formulario cuando cambie el historial o cuando se abra el modal
  useEffect(() => {
    if (historial) {
      // Cargar datos del historial para editar
      loadHistorialData(historial);
    } else {
      // Limpiar formulario para crear nuevo historial
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historial?.ID_Evento, isOpen, user?.ID_Usuario]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Tipo_Evento.trim() && formData.Descripcion.trim() && formData.ID_Animal > 0) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-heart-pulse me-2"></i>
              {historial ? 'Editar Historial Veterinario' : 'Nuevo Historial Veterinario'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                {/* ANIMAL */}
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label fw-semibold">Animal</label>
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
                <div className="col-md-6" hidden>
                  <label htmlFor="usuario" className="form-label fw-semibold">Realizado por</label>
                  <input
                    className="form-control"
                    id="usuario"
                    value={formData.Hecho_Por}
                    onChange={e => setFormData({ ...formData, Hecho_Por: Number(e.target.value) })}
                    required
                  />
                </div>

                {/* TIPO EVENTO */}
                <div className="col-md-6">
                  <label htmlFor="tipo" className="form-label fw-semibold">Tipo de Evento</label>
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
                  <label htmlFor="fecha" className="form-label fw-semibold">Fecha de Aplicación</label>
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
                  <label htmlFor="proxima" className="form-label fw-semibold">Próxima Fecha</label>
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
                  <label htmlFor="descripcion" className="form-label fw-semibold">Descripción</label>
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
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)' }}>
              <div className="d-flex justify-content-end gap-2 w-100">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-apply">
                  <i className="bi bi-check-circle me-2"></i>
                  {historial ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export function Historial() {
  const { params, updateParams, clearParams } = useQueryParams<HistorialFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: HistorialFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };

  const { data: historialData, isLoading, error } = useHistorial(currentParams);
  const createMutation = useCreateHistorial();
  const updateMutation = useUpdateHistorial();
  const deleteMutation = useDeleteHistorial();
  const { showToast } = useToast();

  const { data: animalesData } = useAnimales({});
  const { data: usuariosData } = useUsuarios();

  const historial: HistorialVeterinario[] = historialData?.data || [];
  const animales = animalesData?.data || [];
  const usuarios = usuariosData?.data || [];
  const pagination = historialData?.pagination;

  const [modalState, setModalState] = useState<{ isOpen: boolean; historial?: HistorialVeterinario }>({ isOpen: false });

  // Estado local para los valores de los filtros de texto
  const [textFilterValues, setTextFilterValues] = useState<{
    Tipo_Evento: string;
  }>({
    Tipo_Evento: params.Tipo_Evento || '',
  });

  const handleFilterChange = (key: keyof HistorialFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value });
    }
  };

  const handleTextInputChange = (key: 'Tipo_Evento', value: string) => {
    // Solo actualizar el estado local, no aplicar el filtro
    setTextFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchClick = (key: 'Tipo_Evento') => {
    // Aplicar el filtro solo cuando se hace clic en "Buscar"
    const value = textFilterValues[key];
    if (value.trim() === '') {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value.trim() });
    }
  };

  const clearAllFilters = () => {
    clearParams();
    setTextFilterValues({
      Tipo_Evento: '',
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const openModal = (historial?: HistorialVeterinario) => setModalState({ isOpen: true, historial });
  const closeModal = () => setModalState({ isOpen: false });

  const handleDelete = async (item: HistorialVeterinario) => {
    if (window.confirm('¿Seguro que deseas eliminar este evento del historial veterinario?')) {
      try {
        await deleteMutation.mutateAsync(item.ID_Evento);
        showToast('Historial eliminado exitosamente', 'success');
        // Actualizar contador de notificaciones
        const tryUpdateNotificationCount = (retries = 5) => {
          if (window.updateNotificationCount) {
            window.updateNotificationCount();
          } else if (retries > 0) {
            setTimeout(() => tryUpdateNotificationCount(retries - 1), 200);
          }
        };
        tryUpdateNotificationCount();
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
      // Actualizar contador de notificaciones
      const tryUpdateNotificationCount = (retries = 5) => {
        if (window.updateNotificationCount) {
          window.updateNotificationCount();
        } else if (retries > 0) {
          setTimeout(() => tryUpdateNotificationCount(retries - 1), 200);
        }
      };
      tryUpdateNotificationCount();
    } catch {
      showToast('Error al guardar el historial', 'error');
    }
  };

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar el historial veterinario</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Gestión', path: '#' },
          { label: 'Historial Veterinario', active: true }
        ]}
      />

      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
        <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-heart-pulse me-3"></i>
                Historial Veterinario
              </h1>
              <p className=" mb-0 fs-6">
                {isLoading ? 'Cargando historial...' : pagination ? `${pagination.totalCount} eventos registrados` : `${historial.length} eventos registrados`}
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button 
                className="btn btn-outline-secondary d-lg-none" 
                data-bs-toggle="offcanvas" 
                data-bs-target="#filtersOffcanvas"
                aria-label="Abrir filtros"
              >
                <i className="bi bi-funnel me-2"></i>
                Filtros
                {hasActiveFilters && (
                  <span className="badge bg-primary ms-2">{Object.keys(params).length}</span>
                )}
              </button>
              <button className="btn btn-apply" onClick={() => openModal()}>
                <i className="bi bi-plus-circle-fill me-2"></i>
                <span className="fw-bold">Añadir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Filters Panel */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="filters-panel d-none d-lg-block">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-funnel-fill me-2"></i>
                Filtros de Búsqueda
              </h6>
              {hasActiveFilters && (
                <button className="btn btn-outline-secondary btn-sm" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-1"></i>
                  Limpiar Filtros
                </button>
              )}
            </div>
            <div className="row">
              <div className="col-md-3">
                <label className="form-label">Animal</label>
                <select
                  className="form-select"
                  value={params.ID_Animal || ''}
                  onChange={(e) => handleFilterChange('ID_Animal', e.target.value ? Number(e.target.value) : undefined)}
                  aria-label="Filtrar por animal"
                >
                  <option value="">Todos los animales</option>
                  {animales.map((animal) => (
                    <option key={animal.ID_Animal} value={animal.ID_Animal}>
                      {animal.Nombre} - {animal.CategoriaTipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Tipo de Evento</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={textFilterValues.Tipo_Evento}
                    onChange={(e) => handleTextInputChange('Tipo_Evento', e.target.value)}
                    placeholder="Ej: Vacunación, Tratamiento..."
                    aria-label="Filtrar por tipo de evento"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => handleSearchClick('Tipo_Evento')}
                    title="Buscar"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-2">
                <label className="form-label">Fecha desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaDesde || ''}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                  aria-label="Fecha desde"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Fecha hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaHasta || ''}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                  aria-label="Fecha hasta"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Realizado por</label>
                <select
                  className="form-select"
                  value={params.Hecho_Por || ''}
                  onChange={(e) => handleFilterChange('Hecho_Por', e.target.value ? Number(e.target.value) : undefined)}
                  aria-label="Filtrar por usuario"
                >
                  <option value="">Todos los usuarios</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.ID_Usuario} value={usuario.ID_Usuario}>
                      {usuario.Nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Offcanvas */}
      <div className="offcanvas offcanvas-start filters-offcanvas" tabIndex={-1} id="filtersOffcanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title d-flex align-items-center">
            <i className="bi bi-funnel-fill me-2"></i>
            Filtros de Búsqueda
          </h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Cerrar filtros"></button>
        </div>
        <div className="offcanvas-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">Animal</label>
              <select
                className="form-select"
                value={params.ID_Animal || ''}
                onChange={(e) => handleFilterChange('ID_Animal', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por animal"
              >
                <option value="">Todos los animales</option>
                {animales.map((animal) => (
                  <option key={animal.ID_Animal} value={animal.ID_Animal}>
                    {animal.Nombre} - {animal.CategoriaTipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Tipo de Evento</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={textFilterValues.Tipo_Evento}
                  onChange={(e) => handleTextInputChange('Tipo_Evento', e.target.value)}
                  placeholder="Ej: Vacunación, Tratamiento..."
                  aria-label="Filtrar por tipo de evento"
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleSearchClick('Tipo_Evento')}
                  title="Buscar"
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Fecha desde</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                aria-label="Fecha desde"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Fecha hasta</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                aria-label="Fecha hasta"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Realizado por</label>
              <select
                className="form-select"
                value={params.Hecho_Por || ''}
                onChange={(e) => handleFilterChange('Hecho_Por', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por usuario"
              >
                <option value="">Todos los usuarios</option>
                {usuarios.map((usuario) => (
                  <option key={usuario.ID_Usuario} value={usuario.ID_Usuario}>
                    {usuario.Nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-apply" data-bs-dismiss="offcanvas">
              <i className="bi bi-search me-2"></i>
              Aplicar Filtros
            </button>
            <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
              <i className="bi bi-x-circle me-2"></i>
              Limpiar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="card">
          <div className="card-body table-state-loading">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border mb-3" style={{ color: 'var(--color-base-green)' }} role="status">
                <span className="visually-hidden">Cargando historial veterinario...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando historial veterinario...</h6>
            </div>
          </div>
        </div>
      ) : historial.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-heart-pulse display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">No se encontraron eventos</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? 'No hay eventos que coincidan con los filtros aplicados.'
                  : 'Aún no tienes eventos registrados en el historial veterinario.'
                }
              </p>
              {hasActiveFilters ? (
                <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar Filtros
                </button>
              ) : (
                <button className="btn btn-apply" onClick={() => openModal()}>
                  <i className="bi bi-plus-circle me-2"></i>
                  Registrar Primer Evento
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0 fw-semibold d-flex align-items-center section-title-dark" style={{ color: 'var(--color-base-green)' }}>
                    <i className="bi bi-list-ul me-2"></i>
                    Eventos del Historial Veterinario
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {historial.length} {historial.length === 1 ? 'evento' : 'eventos'}
                  </span>
                </div>
              </div>
          <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center fw-bold">Animal</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Tipo de Evento</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Descripción</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Fecha Aplicación</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-xl-table-cell">Próxima Fecha</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Realizado por</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                    {historial.map((item: HistorialVeterinario) => (
                      <tr key={item.ID_Evento} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="text-body fw-semibold">{item.AnimalNombre}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-lg-none small text-muted mt-1">
                            <div className="text-body">{item.Descripcion}</div>
                            <div className="text-body">Por: {item.UsuarioNombre}</div>
                            {item.Proxima_Fecha && (
                              <div className="text-body">Próxima: {new Date(item.Proxima_Fecha).toLocaleDateString()}</div>
                            )}
                          </div>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="badge bg-info text-body">{item.Tipo_Evento}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell" title={item.Descripcion}>
                          <div className="text-body">{item.Descripcion}</div>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="text-body">{new Date(item.Fecha_Aplicacion).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-xl-table-cell">
                          <span className="text-body">
                            {item.Proxima_Fecha ? new Date(item.Proxima_Fecha).toLocaleDateString() : '-'}
                          </span>
                        </td>
                        <td className="cell-tight text-center d-none d-md-table-cell">
                          <span className="text-body">{item.UsuarioNombre}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap" role="group" aria-label="Acciones del historial">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(item)}
                              title="Editar"
                              aria-label="Editar historial"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(item)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                              aria-label="Eliminar historial"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {historial.length > 0 && (
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="pagination-ganado">
                {pagination ? (
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalCount}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                    showItemsPerPage={true}
                    itemsPerPageOptions={[5, 10, 20, 50]}
                    hasNextPage={pagination.hasNextPage}
                    hasPrevPage={pagination.hasPrevPage}
                    nextPage={pagination.nextPage}
                    prevPage={pagination.prevPage}
                  />
                ) : (
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center">
                      <label htmlFor="itemsPerPage" className="form-label me-2 mb-0 small">
                        Mostrar:
                      </label>
            <select
                        id="itemsPerPage"
                        className="form-select form-select-sm"
                        style={{ width: 'auto' }}
                        value={currentParams.limit || 10}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        aria-label="Elementos por página"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
                        <option value={50}>50</option>
            </select>
                      <span className="ms-2 text-muted small">por página</span>
                    </div>
                    <div className="text-muted small" aria-live="polite">
                      {isLoading ? 'Cargando...' : `${historial.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
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