import { useState } from 'react';
import { useAnimalesConDetalle } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useEstados } from '../hooks/useEstados';
import { useTiposVenta } from '../hooks/useVentas';
import { useQueryParams } from '../hooks/useQueryParams';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { AnimalesFilters, AnimalConDetalle } from '../types/api';
import { getCachedAnimalImage } from '../utils/imageCache';
import { getImageDisplayUrl } from '../utils/imageUtils';

export function AnimalesDetalle() {
  const { params, updateParams, clearParams } = useQueryParams<AnimalesFilters>();
  
  // Set default pagination parameters if not present
  const currentParams: AnimalesFilters = {
    page: params.page || 1,
    limit: params.limit || 10,
    ...params
  };
  
  const { data: animalesData, isLoading, error } = useAnimalesConDetalle(currentParams);
  const { data: categoriasData } = useCategorias();
  const { data: estadosData } = useEstados();
  const { data: tiposVentaData } = useTiposVenta();

  const animales = animalesData?.data || [];
  const categorias = categoriasData?.data || [];
  const estados = estadosData?.data || [];
  const tiposVenta = tiposVentaData?.data || [];
  const pagination = animalesData?.pagination;

  const [detallesModalState, setDetallesModalState] = useState<{
    isOpen: boolean;
    animal?: AnimalConDetalle;
  }>({ isOpen: false });

  const detalleAnimal = detallesModalState.animal;
  
  // Obtener la URL de imagen correcta para mostrar
  const detalleImageSrc = detalleAnimal 
    ? (getCachedAnimalImage(detalleAnimal.ID_Animal) || getImageDisplayUrl(detalleAnimal.Imagen_URL || undefined))
    : null;

  const handleFilterChange = (key: keyof AnimalesFilters, value: string | number | boolean | undefined) => {
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
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleItemsPerPageChange = (limit: number) => {
    updateParams({ limit, page: 1 }); // Reset to first page when changing items per page
  };

  const openDetallesModal = (animal: AnimalConDetalle) => {
    setDetallesModalState({ isOpen: true, animal });
  };

  const closeDetallesModal = () => {
    setDetallesModalState({ isOpen: false });
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
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', path: '/' },
          { label: 'Animales', path: '/animales' },
          { label: 'Vista Detallada', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center page-title-dark" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-list-check me-3"></i>
                Vista Detallada de Animales
              </h1>
              <p className="mb-0 fs-6">
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
              <div className="col-md-2">
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
              <div className="col-md-2">
                <label className="form-label">Estado</label>
                <select
                  className="form-select"
                  value={params.ID_Estado || ''}
                  onChange={(e) => handleFilterChange('ID_Estado', e.target.value ? Number(e.target.value) : undefined)}
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  {estados.map((estado) => (
                    <option key={estado.ID_Estado} value={estado.ID_Estado}>
                      {estado.Nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Preñez</label>
                <select
                  className="form-select"
                  value={params.Esta_Preniada === undefined ? '' : params.Esta_Preniada ? 'true' : 'false'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      handleFilterChange('Esta_Preniada', undefined);
                    } else {
                      handleFilterChange('Esta_Preniada', value === 'true');
                    }
                  }}
                  aria-label="Filtrar por estado de preñez"
                >
                  <option value="">Todos</option>
                  <option value="true">Preñada</option>
                  <option value="false">No preñada</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label">Ingreso desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaIngresoDesde || ''}
                  onChange={(e) => handleFilterChange('fechaIngresoDesde', e.target.value || undefined)}
                  aria-label="Fecha de ingreso desde"
                />
              </div>
              <div className="col-md-2">
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
            <div className="row mt-3">
              <div className="col-md-2">
                <label className="form-label">Venta desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaVentaDesde || ''}
                  onChange={(e) => handleFilterChange('fechaVentaDesde', e.target.value || undefined)}
                  aria-label="Fecha de venta desde"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Venta hasta</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaVentaHasta || ''}
                  onChange={(e) => handleFilterChange('fechaVentaHasta', e.target.value || undefined)}
                  aria-label="Fecha de venta hasta"
                />
              </div>
              <div className="col-md-2">
                <label className="form-label">Tipo de Venta</label>
                <select
                  className="form-select"
                  value={params.Tipo_Venta || ''}
                  onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value || undefined)}
                  aria-label="Filtrar por tipo de venta"
                >
                  <option value="">Todos los tipos</option>
                  {tiposVenta.map((tipo) => (
                    <option key={tipo} value={tipo}>
                      {tipo}
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
              <label className="form-label">Estado</label>
              <select
                className="form-select"
                value={params.ID_Estado || ''}
                onChange={(e) => handleFilterChange('ID_Estado', e.target.value ? Number(e.target.value) : undefined)}
                aria-label="Filtrar por estado"
              >
                <option value="">Todos los estados</option>
                {estados.map((estado) => (
                  <option key={estado.ID_Estado} value={estado.ID_Estado}>
                    {estado.Nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Preñez</label>
              <select
                className="form-select"
                value={params.Esta_Preniada === undefined ? '' : params.Esta_Preniada ? 'true' : 'false'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    handleFilterChange('Esta_Preniada', undefined);
                  } else {
                    handleFilterChange('Esta_Preniada', value === 'true');
                  }
                }}
                aria-label="Filtrar por estado de preñez"
              >
                <option value="">Todos</option>
                <option value="true">Preñada</option>
                <option value="false">No preñada</option>
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
            <div className="col-12">
              <label className="form-label">Venta desde</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaVentaDesde || ''}
                onChange={(e) => handleFilterChange('fechaVentaDesde', e.target.value || undefined)}
                aria-label="Fecha de venta desde"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Venta hasta</label>
              <input
                type="date"
                className="form-control"
                value={params.fechaVentaHasta || ''}
                onChange={(e) => handleFilterChange('fechaVentaHasta', e.target.value || undefined)}
                aria-label="Fecha de venta hasta"
              />
            </div>
            <div className="col-12">
              <label className="form-label">Tipo de Venta</label>
              <select
                className="form-select"
                value={params.Tipo_Venta || ''}
                onChange={(e) => handleFilterChange('Tipo_Venta', e.target.value || undefined)}
                aria-label="Filtrar por tipo de venta"
              >
                <option value="">Todos los tipos</option>
                {tiposVenta.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
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
              <i className="bi bi-list-check display-1 text-muted mb-3"></i>
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
                <a href="/animales" className="btn btn-apply">
                  <i className="bi bi-arrow-left me-2"></i>
                  Ir a Gestión de Animales
                </a>
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
                    Inventario Detallado de Animales
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
                      <th scope="col" className="cell-tight text-center fw-bold">Nombre</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Categoría</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Sexo</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Raza</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-xl-table-cell">Peso</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">F. Nac.</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-xl-table-cell">F. Ingreso</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Estado</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Venta</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animales.map((animal) => (
                      <tr key={animal.ID_Animal} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="text-body">{animal.Nombre}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-md-none small text-muted mt-1">
                            <div className='text-body'>{animal.CategoriaTipo}</div>
                            <div className='text-body'>{animal.Raza} • {animal.Peso} kg</div>
                            <div className='text-body'>
                              {animal.EstadoNombre}
                              {animal.Fecha_Venta && ` • Vendido: ${new Date(animal.Fecha_Venta).toLocaleDateString()}`}
                            </div>
                          </div>
                        </td>
                        <td className="cell-tight text-center text-body d-none d-md-table-cell">
                          <span className="">{animal.CategoriaTipo}</span>
                        </td>
                        <td className="cell-tight text-center text-body">
                          <span className="badge bg-secondary">
                            {animal.Sexo === 'F' ? 'H' : 'M'}
                          </span>
                          <div className="d-md-none small text-body">
                            {animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                          </div>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell" title={animal.Raza}>{animal.Raza}</td>
                        <td className="cell-tight text-center d-none d-xl-table-cell">
                          <span className="">{animal.Peso} kg</span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell">
                          <span className="">{new Date(animal.Fecha_Nacimiento).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-xl-table-cell">
                          <span className="">{new Date(animal.Fecha_Ingreso).toLocaleDateString()}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-md-table-cell">
                          <span className="">{animal.EstadoNombre}</span>
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell">
                          {animal.Fecha_Venta ? (
                            <div className="text-center">
                              <div className="badge bg-success mb-1">{animal.Tipo_Venta}</div>
                              <div className="small text-muted">{new Date(animal.Fecha_Venta).toLocaleDateString()}</div>
                            </div>
                          ) : (
                            <span className="text-muted">----</span>
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
                              <span className="d-none d-lg-inline ms-1">Ver</span>
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

      {/* Modal de Detalles del Animal */}
      {detallesModalState.isOpen && detallesModalState.animal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title fw-semibold d-flex align-items-center">
                  <i className="bi bi-list-check me-2"></i>
                  Detalles Completos del Animal
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDetallesModal}
                  aria-label="Cerrar modal"
                ></button>
              </div>
              <div className="modal-body bg-light bg-dark-subtle" data-bs-theme="auto">
                <div className="row justify-content-center">
                  <div className="col-11 col-9">
                    <div className="card border-0 shadow-sm bg-body">
                      <div className="card-body">
                        {/* Nombre y ID */}
                        <div className="text-center mb-4">
                          {detalleImageSrc && (
                            <div className="text-center mb-4">
                              <div className="d-inline-block position-relative">
                                <img
                                  src={detalleImageSrc}
                                  alt={`Imagen de ${detallesModalState.animal.Nombre}`}
                                  className="rounded-3 shadow-sm"
                                  style={{ 
                                    maxHeight: 300, 
                                    maxWidth: 300, 
                                    objectFit: 'cover',
                                    border: '3px solid var(--bs-border-color)'
                                  }}
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    console.warn('Error al cargar imagen:', detalleImageSrc);
                                  }}
                                />
                              </div>
                            </div>
                          )}
                          <h4 className="fw-bold text-body mb-2 text-decoration-underline">{detallesModalState.animal.Nombre}</h4>
                        </div>

                        {/* Información Básica */}
                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">SEXO</div>
                              <div className="fw-semibold text-body">
                                {detallesModalState.animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">PESO</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.Peso} kg</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">RAZA</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.Raza}</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">COLOR</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.Color}</div>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="text-center p-3 bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">CATEGORÍA</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.CategoriaTipo}</div>
                            </div>
                          </div>
                        </div>

                        {/* Fechas */}
                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">FECHA DE NACIMIENTO</div>
                              <div className="fw-semibold text-body">
                                {new Date(detallesModalState.animal.Fecha_Nacimiento).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">FECHA DE INGRESO</div>
                              <div className="fw-semibold text-body">
                                {new Date(detallesModalState.animal.Fecha_Ingreso).toLocaleDateString('es-ES', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Estado Reproductivo */}
                        <div className="text-center mb-4">
                          <div className="p-3 border bg-light bg-dark-subtle rounded-3">
                            <div className="text-muted small mb-1">ESTADO REPRODUCTIVO</div>
                            <div className="fw-semibold text-body">
                              {detallesModalState.animal.Esta_Preniada ? (
                                <span className="text-warning">Preñada</span>
                              ) : (
                                <span className="text-muted">No preñada</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Información de Preñez */}
                        {detallesModalState.animal.Esta_Preniada && (
                          <div className="row g-3 mb-4">
                            {detallesModalState.animal.Fecha_Monta && (
                              <div className="col-6">
                                <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                  <div className="text-muted small mb-1">FECHA DE MONTA</div>
                                  <div className="fw-semibold text-body">
                                    {new Date(detallesModalState.animal.Fecha_Monta).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}
                            {detallesModalState.animal.Fecha_Estimada_Parto && (
                              <div className="col-6">
                                <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                  <div className="text-muted small mb-1">FECHA ESTIMADA DE PARTO</div>
                                  <div className="fw-semibold text-body">
                                    {new Date(detallesModalState.animal.Fecha_Estimada_Parto).toLocaleDateString('es-ES', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </div>
                                </div>
                                <div className="text-center small text-muted mt-1">
                                  {Math.ceil((new Date(detallesModalState.animal.Fecha_Estimada_Parto!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días restantes
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Estado Actual */}
                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">ESTADO ACTUAL</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.EstadoNombre}</div>
                            </div>
                          </div>
                          {detallesModalState.animal.Fecha_Fallecimiento && (
                            <div className="col-6">
                              <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                <div className="text-muted small mb-1">FECHA DE FALLECIMIENTO</div>
                                <div className="fw-semibold text-body">
                                  {new Date(detallesModalState.animal.Fecha_Fallecimiento).toLocaleDateString('es-ES', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Información de Venta */}
                        {detallesModalState.animal.Fecha_Venta && (
                          <div className="row g-3 mb-4">
                            <div className="col-12">
                              <div className="text-center p-3 border bg-success bg-opacity-10 rounded-3">
                                <div className="text-muted small mb-1">INFORMACIÓN DE VENTA</div>
                                <div className="fw-semibold text-body">
                                  <div className="row">
                                    <div className="col-4">
                                      <div className="small text-muted">FECHA</div>
                                      <div>{new Date(detallesModalState.animal.Fecha_Venta).toLocaleDateString('es-ES')}</div>
                                    </div>
                                    <div className="col-4">
                                      <div className="small text-muted">TIPO</div>
                                      <div>{detallesModalState.animal.Tipo_Venta}</div>
                                    </div>
                                    <div className="col-4">
                                      <div className="small text-muted">PRECIO</div>
                                      <div>${detallesModalState.animal.Precio?.toLocaleString()}</div>
                                    </div>
                                  </div>
                                  {detallesModalState.animal.Comprador && (
                                    <div className="mt-2">
                                      <div className="small text-muted">COMPRADOR</div>
                                      <div>{detallesModalState.animal.Comprador}</div>
                                    </div>
                                  )}
                                    <div className="mt-2">
                                      <div className="small text-muted">REGISTRADO POR</div>
                                      <div className="fw-semibold text-body">Usuario: {detallesModalState.animal.UsuarioNombre}</div>
                                    </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Estadísticas Calculadas */}
                        <div className="row g-3 mb-4">
                          <div className="col-6">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">EDAD</div>
                              <div className="fw-semibold text-body">
                                {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))} año/s
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">DÍAS EN SISTEMA</div>
                              <div className="fw-semibold text-body">
                                {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Ingreso).getTime()) / (1000 * 60 * 60 * 24))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Observaciones */}
                        {detallesModalState.animal.Observaciones && (
                          <div className="mt-4">
                            <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                              <div className="text-muted small mb-1">OBSERVACIONES</div>
                              <div className="fw-semibold text-body">{detallesModalState.animal.Observaciones}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 p-3" data-bs-theme="auto" style={{ background: 'var(--color-base-green)'}}>
                <div className="d-flex justify-content-end gap-2 w-100">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDetallesModal}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cerrar
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