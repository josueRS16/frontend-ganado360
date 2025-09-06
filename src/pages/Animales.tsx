import { useState } from 'react';
import { useAnimales, useDeleteAnimal } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../context/ToastContext';
import { AnimalForm } from './AnimalForm';
import { Pagination } from '../components/ui/Pagination';
import type { AnimalesFilters, Animal } from '../types/api';

export function Animales() {
  const { params, updateParams, clearParams } = useQueryParams<AnimalesFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: AnimalesFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };
  const { data: animalesData, isLoading, error } = useAnimales(currentParams);
  const { data: categoriasData } = useCategorias();
  const deleteMutation = useDeleteAnimal();
  const { showToast } = useToast();

  const animales = animalesData?.data || [];
  const categorias = categoriasData?.data || [];
  const pagination = animalesData?.pagination;

/*   const [showFilters, setShowFilters] = useState(false);
 */  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    animal?: Animal;
  }>({ isOpen: false });

  const [partoModalState, setPartoModalState] = useState<{
    isOpen: boolean;
    animal?: Animal;
  }>({ isOpen: false });

  const [detallesModalState, setDetallesModalState] = useState<{
    isOpen: boolean;
    animal?: Animal;
  }>({ isOpen: false });

  const handleFilterChange = (key: keyof AnimalesFilters, value: string | number | undefined) => {
    if (value === '' || value === undefined) {
      const newParams = { ...params };
      delete newParams[key];
      updateParams(newParams);
    } else {
      updateParams({ [key]: value });
    }
  };

  const clearAllFilters = () => {
    clearParams();
    /* setShowFilters(false); */
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const openModal = (animal?: Animal) => {
    setModalState({ isOpen: true, animal });
  };

  const closeModal = () => {
    setModalState({ isOpen: false });
  };

  const openPartoModal = (animal: Animal) => {
    setPartoModalState({ isOpen: true, animal });
  };

  const closePartoModal = () => {
    setPartoModalState({ isOpen: false });
  };

  const openDetallesModal = (animal: Animal) => {
    setDetallesModalState({ isOpen: true, animal });
  };

  const closeDetallesModal = () => {
    setDetallesModalState({ isOpen: false });
  };

  const handleDelete = async (animal: Animal) => {
    if (window.confirm(`¿Estás seguro de eliminar el animal "${animal.Nombre}"?`)) {
      try {
        await deleteMutation.mutateAsync(animal.ID_Animal);
        showToast('Animal eliminado exitosamente', 'success');
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error al eliminar el animal';
        showToast(errorMessage, 'error');
      }
    }
  };

  const hasActiveFilters = Object.keys(params).length > 0;

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        <h4 className="alert-heading">Error al cargar los animales</h4>
        <p>{error.message || 'Ocurrió un error inesperado'}</p>
        <button className="btn btn-outline-danger" onClick={() => window.location.reload()}>
          Intentar de nuevo
        </button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-diagram-3-fill me-3"></i>
                Gestión de Ganado
              </h1>
              <p className=" mb-0 fs-6">
                {isLoading ? 'Cargando inventario...' : pagination ? `${pagination.totalCount} animales registrados` : `${animales.length} animales registrados`}
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
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={params.ID_Categoria || ''}
                  onChange={(e) => handleFilterChange('ID_Categoria', e.target.value ? Number(e.target.value) : undefined)}
                  aria-label="Filtrar por categoría"
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                      {categoria.Tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Sexo</label>
                <select
                  className="form-select"
                  value={params.Sexo || ''}
                  onChange={(e) => handleFilterChange('Sexo', e.target.value as "M" | "F" || undefined)}
                  aria-label="Filtrar por sexo"
                >
                  <option value="">Todos</option>
                  <option value="M">Macho</option>
                  <option value="F">Hembra</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Ingreso desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaIngresoDesde || ''}
                  onChange={(e) => handleFilterChange('fechaIngresoDesde', e.target.value || undefined)}
                  aria-label="Fecha de ingreso desde"
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Ingreso hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaIngresoHasta || ''}
                  onChange={(e) => handleFilterChange('fechaIngresoHasta', e.target.value || undefined)}
                  aria-label="Fecha de ingreso hasta"
                />
              </div>
             {/*  <div className="col-md-1 d-grid">
                <button className="btn btn-apply" type="button">
                  <i className="bi bi-search"></i>
                </button>
              </div> */}
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
              <label className="form-label">Categoría</label>
              <select
                className="form-select"
                value={params.ID_Categoria || ''}
                onChange={(e) => handleFilterChange('ID_Categoria', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por categoría"
              >
                <option value="">Todas las categorías</option>
                {categorias.map((categoria) => (
                  <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                    {categoria.Tipo}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Sexo</label>
              <select
                className="form-select"
                value={params.Sexo || ''}
                onChange={(e) => handleFilterChange('Sexo', e.target.value as "M" | "F" || undefined)}
                aria-label="Filtrar por sexo"
              >
                <option value="">Todos</option>
                <option value="M">Macho</option>
                <option value="F">Hembra</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Ingreso desde</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaIngresoDesde || ''}
                onChange={(e) => handleFilterChange('fechaIngresoDesde', e.target.value || undefined)}
                aria-label="Fecha de ingreso desde"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Ingreso hasta</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaIngresoHasta || ''}
                onChange={(e) => handleFilterChange('fechaIngresoHasta', e.target.value || undefined)}
                aria-label="Fecha de ingreso hasta"
              />
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
                <span className="visually-hidden">Cargando inventario de animales...</span>
              </div>
              <h6 className="text-muted mb-0">Cargando inventario de animales...</h6>
            </div>
          </div>
        </div>
      ) : animales.length === 0 ? (
        <div className="card">
          <div className="card-body table-state-empty">
            <div className="d-flex flex-column align-items-center">
              <i className="bi bi-diagram-3 display-1 text-muted mb-3"></i>
              <h5 className="text-muted mb-2">No se encontraron animales</h5>
              <p className="text-muted text-center mb-4">
                {hasActiveFilters 
                  ? 'No hay animales que coincidan con los filtros aplicados.'
                  : 'Aún no tienes animales registrados en el sistema.'
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
                  Registrar Primer Animal
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
                    Inventario de Animales
                  </h6>
                  <span className="badge rounded-pill px-3 py-2" style={{ 
                    backgroundColor: 'var(--color-sage-gray)', 
                    color: 'var(--color-charcoal)' 
                  }}>
                    {animales.length} {animales.length === 1 ? 'animal' : 'animales'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-ganado table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th scope="col" className="cell-tight text-center">Nombre</th>
                      <th scope="col" className="cell-tight text-center">Categoría</th>
                      <th scope="col" className="cell-tight text-center">Sexo</th>
                      <th scope="col" className="cell-tight text-center">Raza</th>
                      <th scope="col" className="cell-tight text-center">Peso</th>
                      <th scope="col" className="cell-tight text-center">F. Nac.</th>
                      <th scope="col" className="cell-tight text-center">F. Ingreso</th>
                      <th scope="col" className="cell-tight text-center">Estado</th>
                      <th scope="col" className="cell-tight text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animales.map((animal) => (
                      <tr key={animal.ID_Animal} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="fw-semibold">{animal.Nombre}</div>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="badge bg-secondary">{animal.CategoriaTipo}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <span className={`badge ${animal.Sexo === 'F' ? 'bg-warning text-dark' : 'bg-secondary text-white'}`}>
                            {animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                          </span>
                        </td>
                        <td className="cell-tight text-center fw-semibold" title={animal.Raza}>{animal.Raza}</td>
                        <td className="cell-tight text-center">
                          <span className="fw-medium">{animal.Peso} kg</span>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="small fw-semibold">{new Date(animal.Fecha_Nacimiento).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center">
                          <span className="small fw-semibold">{new Date(animal.Fecha_Ingreso).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center">
                          {animal.Esta_Preniada === 1 ? (
                            <button 
                              className="btn btn-link p-0 text-decoration-none"
                              onClick={() => openPartoModal(animal)}
                              style={{ border: 'none', background: 'none' }}
                              aria-label="Ver fecha estimada de parto"
                            >
                              <span className="badge bg-warning text-dark">
                                {/* <i className="bi bi-heart-fill me-1"></i> */}
                                Preñada
                              </span>
                            </button>
                          ) : (
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-check-circle me-1"></i>
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="cell-tight text-center">
                          <div className="btn-group" role="group" aria-label="Acciones del animal">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => openDetallesModal(animal)}
                              title="Ver detalles"
                              aria-label="Ver detalles del animal"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openModal(animal)}
                              title="Editar"
                              aria-label="Editar animal"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(animal)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                              aria-label="Eliminar animal"
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
      {animales.length > 0 && (
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
                      {isLoading ? 'Cargando...' : `${animales.length} resultados`}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimalForm
        animal={modalState.animal}
        isOpen={modalState.isOpen}
        onClose={closeModal}
      />

      {/* Modal de Fecha Estimada de Parto */}
      {partoModalState.isOpen && partoModalState.animal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title d-flex align-items-center">
                  <i className="bi bi-heart-fill me-2"></i>
                  Fecha Estimada de Parto
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closePartoModal}
                  aria-label="Cerrar modal"
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="text-center">
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Animal:</h6>
                    <h5 className="fw-bold" style={{ color: 'var(--color-base-green)' }}>{partoModalState.animal.Nombre}</h5>
                  </div>
                  <div className="mb-4">
                    <h6 className="text-muted mb-2">Fecha Estimada de Parto:</h6>
                    <h4 className="fw-bold" style={{ color: 'var(--color-tint1)' }}>
                      {partoModalState.animal.Fecha_Estimada_Parto 
                        ? new Date(partoModalState.animal.Fecha_Estimada_Parto).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'No especificada'
                      }
                    </h4>
                  </div>
                  {partoModalState.animal.Fecha_Estimada_Parto && (
                    <div className="alert alert-info border-0" style={{ background: 'rgba(18, 107, 50, 0.1)' }}>
                      <div className="d-flex align-items-center justify-content-center">
                        <i className="bi bi-calendar-check me-2" style={{ color: 'var(--color-tint1)' }}></i>
                        <small className="fw-semibold">
                          <strong>Días restantes:</strong> {
                            Math.ceil((new Date(partoModalState.animal.Fecha_Estimada_Parto!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                          } días
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-apply"
                  onClick={closePartoModal}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Animal */}
      {detallesModalState.isOpen && detallesModalState.animal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title d-flex align-items-center">
                  <i className="bi bi-diagram-3-fill me-2"></i>
                  Detalles del Animal
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDetallesModal}
                  aria-label="Cerrar modal"
                ></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  {/* Información Básica */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <i className="bi bi-info-circle-fill me-2"></i>
                          Información Básica
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-semibold text-muted">Nombre:</label>
                            <p className="fw-bold fs-5" style={{ color: 'var(--color-base-green)' }}>{detallesModalState.animal.Nombre}</p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">ID:</label>
                            <p className="fw-medium">#{detallesModalState.animal.ID_Animal}</p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">Sexo:</label>
                            <p className="fw-medium">
                              <span className={`badge ${detallesModalState.animal.Sexo === 'F' ? 'bg-success' : 'bg-info'}`}>
                                {detallesModalState.animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                              </span>
                            </p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">Raza:</label>
                            <p className="fw-medium">{detallesModalState.animal.Raza}</p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">Color:</label>
                            <p className="fw-medium">{detallesModalState.animal.Color}</p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">Peso:</label>
                            <p className="fw-medium">{detallesModalState.animal.Peso} kg</p>
                          </div>
                          <div className="col-6">
                            <label className="form-label fw-semibold text-muted">Categoría:</label>
                            <p className="fw-medium">
                              <span className="badge bg-secondary">{detallesModalState.animal.CategoriaTipo}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fechas y Estado */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm">
                      <div className="card-header" style={{ background: 'var(--color-tint1)', color: 'white' }}>
                        <h6 className="card-title mb-0 d-flex align-items-center">
                          <i className="bi bi-calendar-event me-2"></i>
                          Fechas y Estado
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-semibold text-muted">Fecha de Nacimiento:</label>
                            <p className="fw-medium">{new Date(detallesModalState.animal.Fecha_Nacimiento).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold text-muted">Fecha de Ingreso:</label>
                            <p className="fw-medium">{new Date(detallesModalState.animal.Fecha_Ingreso).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold text-muted">Estado Reproductivo:</label>
                            <p className="fw-medium">
                              {detallesModalState.animal.Esta_Preniada === 1 ? (
                                <span className="badge bg-warning text-black">
                                  <span className="me-1">🤱</span>
                                  Preñada
                                </span>
                              ) : (
                                <span className="badge bg-light text-dark">
                                  <span className="me-1">✅</span>
                                  Activo
                                </span>
                              )}
                            </p>
                          </div>
                          {detallesModalState.animal.Esta_Preniada === 1 && (
                            <>
                              {detallesModalState.animal.Fecha_Monta && (
                                <div className="col-12">
                                  <label className="form-label fw-semibold text-muted">Fecha de Monta:</label>
                                  <p className="fw-medium">{new Date(detallesModalState.animal.Fecha_Monta).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}</p>
                                </div>
                              )}
                              {detallesModalState.animal.Fecha_Estimada_Parto && (
                                <div className="col-12">
                                  <label className="form-label fw-semibold text-muted">Fecha Estimada de Parto:</label>
                                  <p className="fw-medium text-primary">
                                    {new Date(detallesModalState.animal.Fecha_Estimada_Parto).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </p>
                                  <div className="alert alert-info py-2">
                                    <small>
                                      <strong>Días restantes:</strong> {
                                        Math.ceil((new Date(detallesModalState.animal.Fecha_Estimada_Parto!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                                      } días
                                    </small>
                                  </div>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información Adicional */}
                <div className="row mt-3">
                  <div className="col-12">
                    <div className="card border-0 bg-light">
                      <div className="card-header bg-info text-white">
                        <h6 className="card-title mb-0">
                          <span className="me-2">📊</span>
                          Información Adicional
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="text-center">
                              <h6 className="text-muted">Edad</h6>
                              <p className="fw-bold text-primary fs-5">
                                {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))} años
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <h6 className="text-muted">Días en el Sistema</h6>
                              <p className="fw-bold text-success fs-5">
                                {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Ingreso).getTime()) / (1000 * 60 * 60 * 24))} días
                              </p>
                            </div>
                          </div>
                          <div className="col-md-4">
                            <div className="text-center">
                              <h6 className="text-muted">Estado de Salud</h6>
                              <p className="fw-bold text-success fs-5">
                                <span className="badge bg-success">Saludable</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeDetallesModal}
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-apply"
                  onClick={() => {
                    closeDetallesModal();
                    openModal(detallesModalState.animal);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Editar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}