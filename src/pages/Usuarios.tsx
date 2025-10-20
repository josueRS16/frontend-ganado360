import { useState, useEffect } from 'react';
import { useUsuarios, useCreateUsuario, useUpdateUsuario, useDeleteUsuario } from '../hooks/useUsuarios';
import { useRoles } from '../hooks/useRoles';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../hooks/useToast';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { Usuario, UsuarioRequest, UsuariosFilters } from '../types/api';

interface UsuarioModalProps {
  usuario?: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: UsuarioRequest) => void;
}

// Helper function to create initial form data
const createInitialFormData = (usuario?: Usuario): UsuarioRequest => {
  return {
    Nombre: usuario?.Nombre || '',
    Correo: usuario?.Correo || '',
    Contraseña: '',
    RolID: usuario?.RolID || 1,
  };
};

function UsuarioModal({ usuario, isOpen, onClose, onSave }: UsuarioModalProps) {
  const { data: rolesData } = useRoles();
  const roles = rolesData?.data || [];

  const [formData, setFormData] = useState<UsuarioRequest>(createInitialFormData(usuario));

  // Update form data when usuario prop changes
  useEffect(() => {
    setFormData(createInitialFormData(usuario));
  }, [usuario]);

  // Reset form when modal is closed
  const handleClose = () => {
    setFormData(createInitialFormData());
    onClose();
  };

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
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
            <h5 className="modal-title fw-semibold d-flex align-items-center">
              <i className={`bi ${usuario ? 'bi-pencil-square' : 'bi-person-plus'} me-2`}></i>
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
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
              {/* Información del Usuario */}
              <div className="card border-0 shadow-sm">
                <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                  <h6 className="card-title mb-0 d-flex align-items-center">
                    <i className="bi bi-person-fill me-2"></i>
                    Información del Usuario
                  </h6>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="nombre"
                          placeholder="Nombre completo"
                          value={formData.Nombre}
                          onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
                          required
                        />
                        <label htmlFor="nombre">Nombre Completo</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="correo"
                          placeholder="correo@ejemplo.com"
                          value={formData.Correo}
                          onChange={(e) => setFormData({ ...formData, Correo: e.target.value })}
                          required
                        />
                        <label htmlFor="correo">Correo Electrónico</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="password"
                          className="form-control"
                          id="contraseña"
                          placeholder="Contraseña"
                          value={formData.Contraseña}
                          onChange={(e) => setFormData({ ...formData, Contraseña: e.target.value })}
                          required={!usuario}
                        />
                        <label htmlFor="contraseña">
                          Contraseña {usuario && <small className="text-muted">(dejar vacío para no cambiar)</small>}
                        </label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="rol"
                          value={formData.RolID}
                          onChange={(e) => setFormData({ ...formData, RolID: Number(e.target.value) })}
                          required
                        >
                          <option value="">Seleccionar rol</option>
                          {roles.map(rol => (
                            <option key={rol.RolID} value={rol.RolID}>
                              {rol.Nombre}
                            </option>
                          ))}
                        </select>
                        <label htmlFor="rol">Rol del Usuario</label>
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
                  <i className={`bi ${usuario ? 'bi-check-circle' : 'bi-person-plus'} me-2`}></i>
                  {usuario ? 'Actualizar' : 'Crear'}
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

export function Usuarios() {
  const { params, updateParams, clearParams } = useQueryParams<UsuariosFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: UsuariosFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };
  const { data: usuariosData, isLoading, error } = useUsuarios(currentParams);
  const { data: rolesData } = useRoles();
  const createMutation = useCreateUsuario();
  const updateMutation = useUpdateUsuario();
  const deleteMutation = useDeleteUsuario();
  const { showToast } = useToast();

  const usuarios = usuariosData?.data || [];
  const roles = rolesData?.data || [];
  const pagination = usuariosData?.pagination;

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    usuario?: Usuario;
  }>({ isOpen: false });

  // Estado local para los valores de los filtros de texto
  const [textFilterValues, setTextFilterValues] = useState<{
    Nombre: string;
    Correo: string;
  }>({
    Nombre: params.Nombre || '',
    Correo: params.Correo || '',
  });

  const handleFilterChange = (key: keyof UsuariosFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value });
    }
  };

  const handleTextInputChange = (key: 'Nombre' | 'Correo', value: string) => {
    // Solo actualizar el estado local, no aplicar el filtro
    setTextFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearchClick = (key: 'Nombre' | 'Correo') => {
    // Aplicar el filtro solo cuando se hace clic en "Buscar"
    const value = textFilterValues[key];
    if (value.trim() === '') {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      // Validar formato de correo electrónico si es el filtro de correo
      if (key === 'Correo') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value.trim())) {
          showToast('Por favor ingresa un correo electrónico válido', 'error');
          return;
        }
      }
      updateParams({ [key]: value.trim() });
    }
  };

  const clearAllFilters = () => {
    clearParams();
    setTextFilterValues({
      Nombre: '',
      Correo: '',
    });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

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

  const handleCloseModal = () => {
    setModalState({ isOpen: false });
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

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los usuarios</h4>
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
          { label: 'Configuración', path: '#' },
          { label: 'Usuarios', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-people-fill me-3"></i>
                Gestión de Usuarios
              </h1>
              <p className="mb-0 fs-6">
                {isLoading ? 'Cargando usuarios...' : pagination ? `${pagination.totalCount} usuarios registrados` : `${usuarios.length} usuarios registrados`}
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
                <i className="bi bi-person-plus-fill me-2"></i>
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
                <label className="form-label">Nombre</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por nombre..."
                    value={textFilterValues.Nombre}
                    onChange={(e) => handleTextInputChange('Nombre', e.target.value)}
                    aria-label="Filtrar por nombre"
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
              <div className="col-md-4">
                <label className="form-label">Correo</label>
                <div className="input-group">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Buscar por correo..."
                    value={textFilterValues.Correo}
                    onChange={(e) => handleTextInputChange('Correo', e.target.value)}
                    aria-label="Filtrar por correo"
                  />
                  <button 
                    className="btn btn-outline-secondary" 
                    type="button"
                    onClick={() => handleSearchClick('Correo')}
                    title="Buscar"
                  >
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </div>
              <div className="col-md-4">
                <label className="form-label">Rol</label>
                <select
                  className="form-select"
                  value={params.RolNombre || ''}
                  onChange={(e) => handleFilterChange('RolNombre', e.target.value || undefined)}
                  aria-label="Filtrar por rol"
                >
                  <option value="">Todos los roles</option>
                  {roles.map((rol) => (
                    <option key={rol.RolID} value={rol.Nombre}>
                      {rol.Nombre}
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
              <label className="form-label">Nombre</label>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre..."
                  value={textFilterValues.Nombre}
                  onChange={(e) => handleTextInputChange('Nombre', e.target.value)}
                  aria-label="Filtrar por nombre"
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
            <div className="col-12">
              <label className="form-label">Correo</label>
              <div className="input-group">
                <input
                  type="email"
                  className="form-control"
                  placeholder="Buscar por correo..."
                  value={textFilterValues.Correo}
                  onChange={(e) => handleTextInputChange('Correo', e.target.value)}
                  aria-label="Filtrar por correo"
                />
                <button 
                  className="btn btn-outline-secondary" 
                  type="button"
                  onClick={() => handleSearchClick('Correo')}
                  title="Buscar"
                >
                  <i className="bi bi-search"></i>
                </button>
              </div>
            </div>
            <div className="col-12">
              <label className="form-label">Rol</label>
              <select
                className="form-select"
                value={params.RolNombre || ''}
                onChange={(e) => handleFilterChange('RolNombre', e.target.value || undefined)}
                aria-label="Filtrar por rol"
              >
                <option value="">Todos los roles</option>
                {roles.map((rol) => (
                  <option key={rol.RolID} value={rol.Nombre}>
                    {rol.Nombre}
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
                <span className="visually-hidden">Cargando usuarios...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando usuarios...</h6>
            </div>
          </div>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-people display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">No se encontraron usuarios</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? 'No hay usuarios que coincidan con los filtros aplicados.'
                  : 'Aún no tienes usuarios registrados en el sistema.'
                }
              </p>
              {hasActiveFilters ? (
                <button className="btn btn-outline-secondary" onClick={clearAllFilters}>
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar Filtros
                </button>
              ) : (
                <button className="btn btn-apply" onClick={() => openModal()}>
                  <i className="bi bi-person-plus me-2"></i>
                  Registrar Primer Usuario
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
                    Lista de Usuarios
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {usuarios.length} {usuarios.length === 1 ? 'usuario' : 'usuarios'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center fw-bold">Nombre</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Correo</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Rol</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Fecha Creación</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.ID_Usuario} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="text-body fw-semibold">{usuario.Nombre}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-md-none small text-muted mt-1">
                            <div className='text-body'>{usuario.Correo}</div>
                            <div className='text-body'>{new Date(usuario.Creado_En).toLocaleDateString()}</div>
                          </div>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="">{usuario.Correo}</span>
                        </td>
                        <td className="cell-tight text-center text-body">
                          <span className="badge bg-secondary">
                            {usuario.RolNombre}
                          </span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell">
                          <span className="">{new Date(usuario.Creado_En).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <div className="d-flex gap-1 justify-content-center flex-wrap" role="group" aria-label="Acciones del usuario">
                            <button
                              className="btn btn-sm btn-warning"
                              onClick={() => openModal(usuario)}
                              title="Editar"
                              aria-label="Editar usuario"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDelete(usuario)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                              aria-label="Eliminar usuario"
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
      {usuarios.length > 0 && (
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
                      {isLoading ? 'Cargando...' : `${usuarios.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <UsuarioModal
        usuario={modalState.usuario}
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
      />
    </div>
  );
}
