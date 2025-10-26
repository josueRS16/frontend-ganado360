import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecordatorios, useCreateRecordatorio, useUpdateRecordatorio, useDeleteRecordatorio } from '../hooks/useRecordatorios';
import { useAnimales } from '../hooks/useAnimales';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Pagination } from '../components/ui/Pagination';
import http from '../api/http';
import type { RecordatoriosFilters, Recordatorio, RecordatorioRequest } from '../types/api';

interface RecordatorioModalProps {
  recordatorio?: Recordatorio;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RecordatorioRequest) => void;
}

function RecordatorioModal({ recordatorio, isOpen, onClose, onSave }: RecordatorioModalProps) {
  const { t } = useTranslation();
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

  // Función para formatear fecha para input HTML
  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    } catch {
      return '';
    }
  };

  // Actualizar formData cuando cambie el recordatorio (para edición)
  useEffect(() => {
    if (recordatorio) {
      setFormData({
        ID_Animal: recordatorio.ID_Animal,
        Titulo: recordatorio.Titulo,
        Descripcion: recordatorio.Descripcion,
        Fecha_Recordatorio: formatDateForInput(recordatorio.Fecha_Recordatorio),
      });
    } else {
      // Limpiar formulario para nuevo recordatorio
      setFormData({
        ID_Animal: 0,
        Titulo: '',
        Descripcion: '',
        Fecha_Recordatorio: '',
      });
    }
  }, [recordatorio]);

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
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className="bi bi-calendar-check me-2"></i>
              {recordatorio ? t('reminders.editReminder') : t('reminders.newReminder')}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
            <p className="text-muted small">{t('reminders.messages.onlyAlive')}</p>
              <div className="row g-3">
                <div className="col-md-6">
                  <label htmlFor="animal" className="form-label fw-semibold">{t('reminders.form.animal')}</label>
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
                  <label htmlFor="fecha" className="form-label fw-semibold">{t('reminders.form.reminderDate')}</label>
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
                  <label htmlFor="titulo" className="form-label fw-semibold">{t('reminders.form.type')}</label>
                  <input
                    type="text"
                    className="form-control"
                    id="titulo"
                    value={formData.Titulo}
                    onChange={(e) => setFormData({ ...formData, Titulo: e.target.value })}
                    placeholder={t('reminders.form.typePlaceholder')}
                    required
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="descripcion" className="form-label fw-semibold">{t('reminders.form.description')}</label>
                  <textarea
                    className="form-control"
                    id="descripcion"
                    rows={3}
                    value={formData.Descripcion}
                    onChange={(e) => setFormData({ ...formData, Descripcion: e.target.value })}
                    placeholder={t('reminders.form.descriptionPlaceholder')}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)' }}>
              <div className="d-flex justify-content-end gap-2 w-100">
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  <i className="bi bi-x-circle me-2"></i>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-apply">
                  <i className="bi bi-check-circle me-2"></i>
                  {recordatorio ? t('common.update') : t('common.create')}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Recordatorios() {
  const { t } = useTranslation();
  const { params, updateParams, clearParams, setParams } = useQueryParams<RecordatoriosFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: RecordatoriosFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...(params.Estado && { Estado: params.Estado }),
    ...(params.fechaDesde && { fechaDesde: params.fechaDesde }),
    ...(params.fechaHasta && { fechaHasta: params.fechaHasta }),
    ...(params.ID_Animal && { ID_Animal: params.ID_Animal })
  };

  console.log('Parámetros enviados al hook:', currentParams);
  const { data: recordatoriosData, isLoading, error, refetch } = useRecordatorios(currentParams);
  const createMutation = useCreateRecordatorio();
  const updateMutation = useUpdateRecordatorio();
  const deleteMutation = useDeleteRecordatorio();
  const { showToast } = useToast();

  const recordatorios = (recordatoriosData?.data as Recordatorio[]) || [];
  const pagination = recordatoriosData?.pagination;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    recordatorio?: Recordatorio;
  }>({ isOpen: false });

  const [descripcionModalState, setDescripcionModalState] = useState<{
    isOpen: boolean;
    recordatorio?: Recordatorio;
  }>({ isOpen: false });

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  // Effect para detectar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleFilterChange = (key: keyof RecordatoriosFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value });
    }
  };

  const handleEstadoChange = (estado: 'pendiente' | 'hecho' | undefined) => {
    if (estado === undefined) {
      // Forzar la eliminación del parámetro Estado de la URL
      const newParams = { ...params };
      delete newParams.Estado;
      console.log('Limpiando filtro Estado, nuevos params:', newParams);
      
      // Usar setParams para reemplazar completamente los parámetros
      setParams(newParams);
    } else {
      console.log('Aplicando filtro Estado:', estado);
      updateParams({ Estado: estado });
    }
  };

  const clearAllFilters = () => {
    clearParams();
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const openModal = (recordatorio?: Recordatorio) => {
    setModalState({ isOpen: true, recordatorio });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const openDescripcionModal = (recordatorio: Recordatorio) => {
    setDescripcionModalState({ isOpen: true, recordatorio });
  };

  const closeDescripcionModal = () => {
    setDescripcionModalState({ isOpen: false });
  };

  // Función para obtener el maxLength según el tamaño de pantalla
  const getMaxLength = () => {
    const width = screenWidth;
    if (width < 576) {
      return 20; // xs - móvil muy pequeño
    } else if (width < 768) {
      return 30; // sm - móvil pequeño
    } else if (width < 992) {
      return 40; // md - tablet
    } else if (width < 1200) {
      return 35; // lg - desktop pequeño
    } else {
      return 45; // xl+ - desktop grande
    }
  };

  // Función para renderizar la descripción con truncado responsive
  const renderDescripcion = (recordatorio: Recordatorio) => {
    const maxLength = getMaxLength();
    const descripcion = recordatorio.Descripcion;
    
    if (descripcion.length <= maxLength) {
      return <span className="text-muted">{descripcion}</span>;
    }
    
    return (
      <div>
        <span className="text-muted">{descripcion.substring(0, maxLength)}...</span>
        <br />
        <button
          className="btn btn-link p-0 text-decoration-none small page-title-dark"
          onClick={() => openDescripcionModal(recordatorio)}
          style={{ color: 'var(--color-base-green)' }}
        >
          <i className="bi bi-eye me-1"></i>
          Ver completa
        </button>
      </div>
    );
  };

  const handleSave = async (formData: RecordatorioRequest) => {
    try {
      if (modalState.recordatorio) {
        await updateMutation.mutateAsync({
          id: modalState.recordatorio.ID_Recordatorio,
          data: formData
        });
        showToast(t('reminders.messages.updateSuccess'), 'success');
      } else {
        await createMutation.mutateAsync(formData);
        showToast(t('reminders.messages.createSuccess'), 'success');
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
      const errorMessage = error instanceof Error ? error.message : t('reminders.messages.saveError');
      showToast(errorMessage, 'error');
    }
  };

  const handleDelete = async (recordatorio: Recordatorio) => {
    if (window.confirm(`¿Estás seguro de eliminar el recordatorio "${recordatorio.Titulo}"?`)) {
      try {
        await deleteMutation.mutateAsync(recordatorio.ID_Recordatorio);
        showToast(t('reminders.messages.deleteSuccess'), 'success');
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
        const errorMessage = error instanceof Error ? error.message : t('reminders.messages.deleteError');
        showToast(errorMessage, 'error');
      }
    }
  };

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
    } catch {
      showToast(t('reminders.messages.stateChangeError'), 'error');
    }
  };

  // Exponer función global para forzar refetch de la tabla desde otros módulos
  useEffect(() => {
    (window as Window & { refetchRecordatorios?: () => void }).refetchRecordatorios = refetch;
    return () => {
      delete (window as Window & { refetchRecordatorios?: () => void }).refetchRecordatorios;
    };
  }, [refetch]);

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);
    return () => clearInterval(interval);
  }, [refetch]);

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">{t('reminders.messages.errorLoading')}</h4>
        <p>{error.message || t('common.unexpectedError')}</p>
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          {t('common.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: t('dashboard.title'), path: '/' },
          { label: t('reminders.title'), active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-calendar-check me-3"></i>
                {t('reminders.title')}
              </h1>
              <p className="mb-0 fs-6">
                {isLoading ? t('reminders.messages.loading') : pagination ? `${pagination.totalCount} ${t('reminders.messages.registered')}` : `${recordatorios.length} ${t('reminders.messages.registered')}`}
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <button 
                className="btn btn-outline-secondary d-lg-none" 
                data-bs-toggle="offcanvas" 
                data-bs-target="#filtersOffcanvas"
                aria-label={t('animals.buttons.filters')}
              >
                <i className="bi bi-funnel me-2"></i>
                {t('animals.buttons.filters')}
                {hasActiveFilters && (
                  <span className="badge bg-primary ms-2">{Object.keys(params).length}</span>
                )}
              </button>
              <button className="btn btn-apply" onClick={() => openModal()}>
                <i className="bi bi-plus-circle-fill me-2"></i>
                <span className="fw-bold">{t('common.add')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Filter Switch */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-center">
            <div className="btn-group" role="group" aria-label={t('reminders.filters.state')}>
              <button
                type="button"
                className={`btn ${!params.Estado ? 'btn-apply' : 'btn-outline-secondary'}`}
                onClick={() => handleEstadoChange(undefined)}
              >
                <i className="bi bi-list-ul me-2"></i>
                {t('reminders.filters.all')}
              </button>
              <button
                type="button"
                className={`btn ${params.Estado === 'pendiente' ? 'btn-apply' : 'btn-outline-secondary'}`}
                onClick={() => handleEstadoChange('pendiente')}
              >
                <i className="bi bi-clock me-2"></i>
                {t('reminders.filters.pending')}
              </button>
              <button
                type="button"
                className={`btn ${params.Estado === 'hecho' ? 'btn-apply' : 'btn-outline-secondary'}`}
                onClick={() => handleEstadoChange('hecho')}
              >
                <i className="bi bi-check-circle me-2"></i>
                {t('reminders.filters.completed')}
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
                {t('reminders.filters.title')}
              </h6>
              {hasActiveFilters && (
                <button className="btn btn-outline-secondary btn-sm" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-1"></i>
                  {t('animals.buttons.clearFilters')}
                </button>
              )}
            </div>
            <div className="row">
              <div className="col-md-6">
                <label className="form-label">{t('reminders.filters.dateFrom')}</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaDesde || ''}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                  aria-label={t('reminders.filters.dateFrom')}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t('reminders.filters.dateTo')}</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaHasta || ''}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                  aria-label={t('reminders.filters.dateTo')}
                />
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
            {t('reminders.filters.title')}
          </h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label={t('animals.buttons.closeFilters')}></button>
        </div>
        <div className="offcanvas-body">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label">{t('reminders.filters.dateFrom')}</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaDesde || ''}
                onChange={(e) => handleFilterChange('fechaDesde', e.target.value || undefined)}
                aria-label={t('reminders.filters.dateFrom')}
              />
            </div>
            <div className="col-12">
              <label className="form-label">{t('reminders.filters.dateTo')}</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaHasta || ''}
                onChange={(e) => handleFilterChange('fechaHasta', e.target.value || undefined)}
                aria-label={t('reminders.filters.dateTo')}
              />
            </div>
          </div>
          <div className="d-grid gap-2 mt-4">
            <button className="btn btn-apply" data-bs-dismiss="offcanvas">
              <i className="bi bi-search me-2"></i>
              {t('common.applyFilters')}
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
                <span className="visually-hidden">Cargando recordatorios...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando recordatorios...</h6>
            </div>
          </div>
        </div>
      ) : recordatorios.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-calendar-check display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">{t('reminders.messages.noData')}</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? t('reminders.messages.noMatches')
                  : t('reminders.messages.noRegistered')
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
                  Crear Primer Recordatorio
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
                    Lista de Recordatorios
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {recordatorios.length} {recordatorios.length === 1 ? 'recordatorio' : 'recordatorios'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center fw-bold">{t('reminders.table.title')}</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">{t('reminders.table.animal')}</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">{t('reminders.table.description')}</th>
                      <th scope="col" className="cell-tight text-center fw-bold">{t('reminders.table.date')}</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">{t('reminders.table.state')}</th>
                      <th scope="col" className="cell-tight text-center fw-bold">{t('reminders.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordatorios.map((recordatorio: Recordatorio) => (
                      <tr key={recordatorio.ID_Recordatorio} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="text-body fw-semibold">{recordatorio.Titulo}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-md-none small text-muted mt-1">
                            <div className='text-body'>{recordatorio.AnimalNombre}</div>
                            <div className='text-body'>{renderDescripcion(recordatorio)}</div>
                            <div className='text-body'>
                              <span className={`badge ${recordatorio.Estado === 'hecho' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                {recordatorio.Estado === 'hecho' ? t('reminders.filters.completed') : t('reminders.filters.pending')}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="">{recordatorio.AnimalNombre}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell" title={recordatorio.Descripcion}>
                          {renderDescripcion(recordatorio)}
                        </td>
                        <td className="cell-tight text-center text-body">
                          <span className="">{new Date(recordatorio.Fecha_Recordatorio).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-md-table-cell">
                          <span className={`badge ${recordatorio.Estado === 'hecho' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {recordatorio.Estado === 'hecho' ? t('reminders.filters.completed') : t('reminders.filters.pending')}
                          </span>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap" role="group" aria-label={t('reminders.table.actions')}>
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(recordatorio)}
                              title={t('common.edit')}
                              aria-label={t('common.edit')}
                            >
                              <i className="bi bi-pencil"></i>
                              {/* <span className="d-none d-lg-inline ms-1">Editar</span> */}
                            </button>
                            {recordatorio.Estado === 'pendiente' ? (
                              <button
                                className="btn btn-sm btn-success"
                                onClick={() => handleChangeEstado(recordatorio, 'hecho')}
                                title={t('reminders.buttons.markCompleted')}
                                aria-label={t('reminders.buttons.markCompleted')}
                              >
                                <i className="bi bi-check-circle"></i>
                                {/* <span className="d-none d-lg-inline ms-1">Hecho</span> */}
                              </button>
                            ) : (
                              <button
                                className="btn btn-sm btn-secondary"
                                onClick={() => handleChangeEstado(recordatorio, 'pendiente')}
                                title={t('reminders.buttons.markPending')}
                                aria-label={t('reminders.buttons.markPending')}
                              >
                                <i className="bi bi-arrow-clockwise"></i>
                                {/* <span className="d-none d-lg-inline ms-1">Pendiente</span> */}
                              </button>
                            )}
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(recordatorio)}
                              disabled={deleteMutation.isPending}
                              title={t('common.delete')}
                              aria-label={t('common.delete')}
                            >
                              <i className="bi bi-trash"></i>
                              {/* <span className="d-none d-lg-inline ms-1">Eliminar</span> */}
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
      {recordatorios.length > 0 && (
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
                        aria-label={t('pagination.itemsPerPage')}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                      <span className="ms-2 text-muted small">por página</span>
                    </div>
                    <div className="text-muted small" aria-live="polite">
                      {isLoading ? 'Cargando...' : `${recordatorios.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <RecordatorioModal
        recordatorio={modalState.recordatorio}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        onSave={handleSave}
      />

      {/* Modal de Descripción Completa */}
      {descripcionModalState.isOpen && descripcionModalState.recordatorio && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title fw-semibold d-flex align-items-center">
                  <i className="bi bi-card-text me-2"></i>
                  {t('reminders.modal.fullDescription')}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDescripcionModal}
                  aria-label={t('common.close')}
                ></button>
              </div>
              <div className="modal-body bg-light bg-dark-subtle p-4" data-bs-theme="auto">
                <div className="row justify-content-center">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm bg-body">
                      <div className="card-body">
                        {/* Información del recordatorio */}
                        <div className="text-center mb-4">
                          <h4 className="fw-bold text-body mb-2 text-decoration-underline">
                            {descripcionModalState.recordatorio.Titulo}
                          </h4>
                          <p className="text-muted mb-0">
                            <i className="bi bi-diagram-3 me-2"></i>
                            {descripcionModalState.recordatorio.AnimalNombre}
                          </p>
                        </div>

                        {/* Descripción completa */}
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-2 fw-semibold">{t('reminders.modal.fullDescriptionLabel')}</div>
                              <div className="text-body" style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                                {descripcionModalState.recordatorio.Descripcion}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Información adicional */}
                        <div className="row g-3 mt-3">
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">{t('reminders.modal.date')}</div>
                              <div className="fw-semibold text-body">
                                {new Date(descripcionModalState.recordatorio.Fecha_Recordatorio).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">{t('reminders.modal.state')}</div>
                              <div className="fw-semibold text-body">
                                <span className={`badge ${descripcionModalState.recordatorio.Estado === 'hecho' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                  {descripcionModalState.recordatorio.Estado === 'hecho' ? t('reminders.filters.completed') : t('reminders.filters.pending')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)' }}>
                <div className="d-flex justify-content-end gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDescripcionModal}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}