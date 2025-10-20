import { useState, useEffect } from 'react';
import { useRoles, useCreateRol, useUpdateRol, useDeleteRol } from '../hooks/useRoles';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { Rol, RolRequest, RolesFilters } from '../types/api';

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

  // Update form data when rol prop changes
  useEffect(() => {
    setFormData({
      Nombre: rol?.Nombre || '',
    });
  }, [rol]);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData({ Nombre: '' });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.Nombre.trim()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className={`bi ${rol ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
              {rol ? 'Editar Rol' : 'Nuevo Rol'}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={handleClose}
              aria-label="Cerrar modal"
            ></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {/* Información del Rol */}
              <div className="card border-0 shadow-sm">
                <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-person-badge-fill me-2"></i>
                    Información del Rol
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          placeholder="Nombre del rol"
                          value={formData.Nombre}
                          onChange={(e) => setFormData({ Nombre: e.target.value })}
                          required
                        />
                        <label htmlFor="nombre">Nombre del Rol</label>
                      </div>
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Ej: Administrador, Veterinario, Operador, Supervisor, etc.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 p-3" style={{ background: 'var(--color-base-green)'}}>
              <div className="d-flex justify-content-end gap-2 w-100">
                <button 
                  type="submit" 
                  className="btn btn-apply"
                >
                  <i className={`bi ${rol ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                  {rol ? 'Actualizar' : 'Crear'}
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleClose}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export function Roles() {
  const { params, updateParams, clearParams } = useQueryParams<RolesFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: RolesFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };
  const { data: rolesData, isLoading, error } = useRoles(currentParams);
  const createMutation = useCreateRol();
  const updateMutation = useUpdateRol();
  const deleteMutation = useDeleteRol();
  const { showToast } = useToast();

  const roles = rolesData?.data || [];
  const pagination = rolesData?.pagination;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    rol?: Rol;
  }>({ isOpen: false });

  // Estado local para los valores de los filtros de texto
  const [textFilterValues, setTextFilterValues] = useState<{
    Nombre: string;
  }>({
    Nombre: params.Nombre || '',
  });

  const openModal = (rol?: Rol) => {
    setModalState({ isOpen: true, rol });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const handleTextInputChange = (key: 'Nombre', value: string) => {
    // Solo actualizar el estado local, no aplicar el filtro
    setTextFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchClick = (key: 'Nombre') => {
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
      Nombre: '',
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const hasActiveFilters = Object.keys(params).length > 0;

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
    <div className="container-fluid">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Configuración', path: '#' },
          { label: 'Roles', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-person-badge-fill me-3"></i>
                Gestión de Roles
              </h1>
              <p className="mb-0 fs-6">
                {isLoading ? 'Cargando roles...' : pagination ? `${pagination.totalCount} roles registrados` : `${roles.length} roles registrados`}
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
              <div className="col-md-4">
                <label className="form-label">Nombre del Rol</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    value={textFilterValues.Nombre}
                    onChange={(e) => handleTextInputChange('Nombre', e.target.value)}
                    placeholder="Buscar por nombre..."
                    aria-label="Filtrar por nombre del rol"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => handleSearchClick('Nombre')}
                    title="Buscar"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
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
              <label className="form-label">Nombre del Rol</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  value={textFilterValues.Nombre}
                  onChange={(e) => handleTextInputChange('Nombre', e.target.value)}
                  placeholder="Buscar por nombre..."
                  aria-label="Filtrar por nombre del rol"
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleSearchClick('Nombre')}
                  title="Buscar"
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
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
                <span className="visually-hidden">Cargando roles...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando roles...</h6>
            </div>
          </div>
        </div>
      ) : roles.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-person-badge display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">No se encontraron roles</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? 'No hay roles que coincidan con los filtros aplicados.'
                  : 'Aún no tienes roles registrados en el sistema.'
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
                  Registrar Primer Rol
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
                    Lista de Roles
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {roles.length} {roles.length === 1 ? 'rol' : 'roles'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center fw-bold">Nombre</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((rol) => (
                      <tr key={rol.RolID} className="align-middle">
                        <td className="cell-tight text-center text-body">
                          <span className="fw-semibold">{rol.Nombre}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap" role="group" aria-label="Acciones del rol">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(rol)}
                              title="Editar"
                              aria-label="Editar rol"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(rol)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                              aria-label="Eliminar rol"
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
      {roles.length > 0 && (
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
                      {isLoading ? 'Cargando...' : `${roles.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
