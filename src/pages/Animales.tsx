import { useState, useMemo } from 'react';
import { useAnimales } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useQueryParams } from '../hooks/useQueryParams';
import { useToast } from '../context/ToastContext';
import { useDarDeBajaAnimal } from '../hooks/useEstadoAnimal';
import { AnimalForm } from './AnimalForm';
import { Pagination } from '../components/ui/Pagination';
import { DarDeBajaModal } from '../components/modals/DarDeBajaModal';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import type { AnimalesFilters, Animal } from '../types/api';
import { getCachedAnimalImage } from '../utils/imageCache';
import { getImageDisplayUrl } from '../utils/imageUtils';
import { useTranslation } from 'react-i18next';

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
  const darDeBajaMutation = useDarDeBajaAnimal();
  const { showToast } = useToast();
  const { t } = useTranslation();

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

  const [darDeBajaModalState, setDarDeBajaModalState] = useState<{
    isOpen: boolean;
    animal?: Animal;
  }>({ isOpen: false });


  const detalleAnimal = detallesModalState.animal;
  
  // Obtener la URL de imagen correcta para mostrar
  const detalleImageSrc = detalleAnimal 
    ? (getCachedAnimalImage(detalleAnimal.ID_Animal) || getImageDisplayUrl(detalleAnimal.Imagen_URL || undefined))
    : null;

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

  const openDarDeBajaModal = (animal: Animal) => {
    setDarDeBajaModalState({ isOpen: true, animal });
  };

  const closeDarDeBajaModal = () => {
    setDarDeBajaModalState({ isOpen: false });
  };


  const handleDarDeBaja = (animal: Animal) => {
    if (!animal.ID_Estado_Animal) {
      showToast('No se puede dar de baja: el animal no tiene un estado asignado', 'error');
      return;
    }

    // Verificar que el animal no esté ya dado de baja
    if (animal.EstadoNombre === 'Baja') {
      showToast('El animal ya está dado de baja', 'warning');
      return;
    }

    openDarDeBajaModal(animal);
  };

  const hasActiveFilters = Object.keys(params).length > 0;

  // Si tenías cabeceras definidas fuera, móvalas dentro:
  const tableHeaders = useMemo(() => [
    t('nombre'),
    t('sexo'),
    t('categoria'),
    t('fecha_nacimiento'),
    t('acciones')
  ], [t]);

  const sexoLabels = useMemo(() => ({
    M: t('sexo_m'),
    F: t('sexo_f')
  }), [t]);

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
          { label: 'Animales', active: true }
        ]} 
      />
      
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
                      <th scope="col" className="cell-tight text-center fw-bold">Nombre</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Categoría</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Sexo</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Raza</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-xl-table-cell">Peso</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">F. Nac.</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-xl-table-cell">F. Ingreso</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-md-table-cell">Reprod.</th>
                      <th scope="col" className="cell-tight text-center fw-bold d-none d-lg-table-cell">Estado</th>
                      <th scope="col" className="cell-tight text-center fw-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animales.map((animal) => (
                      <tr key={animal.ID_Animal} className="align-middle">
                        <td className="cell-tight text-center">
                          <div className="fw-semibold">{animal.Nombre}</div>
                          {/* Información adicional para móviles */}
                          <div className="d-md-none small text-muted mt-1">
                            <div className='text-body'>{animal.CategoriaTipo}</div>
                            <div className='text-body'>{animal.Raza} • {animal.Peso} kg</div>
                            <div className='text-body'>
                              {animal.Esta_Preniada === 1 ? (
                                <span className="text-body">Preñada</span>
                              ) : (
                                <span className="text-body">No preñada</span>
                              )}
                              {animal.EstadoNombre && ` • ${animal.EstadoNombre}`}
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
                          {animal.Esta_Preniada === 1 ? (
                            <button 
                              className="btn btn-link p-0 text-decoration-none"
                              onClick={() => openPartoModal(animal)}
                              aria-label="Ver fecha estimada de parto"
                            >
                              <span className="text-warning">
                                Preñada
                              </span>
                            </button>
                          ) : (
                            <span className="text-muted">
                              ----
                            </span>
                          )}
                        </td>
                        <td className="cell-tight text-center d-none d-lg-table-cell">
                          <span className="">{animal.EstadoNombre ?? '----'}</span>
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
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openModal(animal)}
                              title="Editar"
                              aria-label="Editar animal"
                            >
                              <i className="bi bi-pencil"></i>
                              <span className="d-none d-lg-inline ms-1">Editar</span>
                            </button>
                             <button
                               className="btn btn-sm btn-outline-danger"
                               onClick={() => handleDarDeBaja(animal)}
                               disabled={darDeBajaMutation.isPending || !animal.ID_Estado_Animal || animal.EstadoNombre === 'Baja'}
                               title={
                                 !animal.ID_Estado_Animal 
                                   ? "Sin estado asignado" 
                                   : animal.EstadoNombre === 'Baja' 
                                     ? "Ya está dado de baja" 
                                     : "Dar de baja"
                               }
                               aria-label="Dar de baja animal"
                             > 
                               <i className="bi bi-arrow-down-circle"></i>
                               <span className="d-none d-lg-inline ms-1">Baja</span>
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

       <DarDeBajaModal
         animal={darDeBajaModalState.animal || null}
         isOpen={darDeBajaModalState.isOpen}
         onClose={closeDarDeBajaModal}
         onSuccess={closeDarDeBajaModal}
       />


      {/* Modal de Fecha Estimada de Parto */}
      {partoModalState.isOpen && partoModalState.animal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title d-flex align-items-center">
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
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header" style={{ background: 'var(--color-base-green)', color: 'white' }}>
                <h5 className="modal-title fw-semibold d-flex align-items-center">
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
              <div className="modal-body bg-light bg-dark-subtle" data-bs-theme="auto">
               {/*  <div className=""> */}
                  {/* Imagen del Animal */}
                  {/* Información del Animal - Una sola columna centrada */}
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
                                {detallesModalState.animal.Esta_Preniada === 1 ? (
                                  <span className="">Preñada</span>
                                ) : (
                                  <span className="">No preñada</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Información de Preñez */}
                          {detallesModalState.animal.Esta_Preniada === 1 && (
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

                          {/* Estadísticas Calculadas */}
                          <div className="row g-3">
                            <div className="col-4">
                              <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                <div className="text-muted small mb-1">EDAD</div>
                                <div className="fw-semibold text-body">
                                  {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Nacimiento).getTime()) / (1000 * 60 * 60 * 24 * 365))} año/s
                                </div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                <div className="text-muted small mb-1">DÍAS EN SISTEMA</div>
                                <div className="fw-semibold text-body">
                                  {Math.floor((new Date().getTime() - new Date(detallesModalState.animal.Fecha_Ingreso).getTime()) / (1000 * 60 * 60 * 24))}
                                </div>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="text-center p-3 border bg-light bg-dark-subtle rounded-3">
                                <div className="text-muted small mb-1">ESTADO</div>
                                <div className="fw-semibold text-body">{detallesModalState.animal.EstadoNombre}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
{/*                 </div>    */}
            </div>
              <div className="modal-footer border-0 p-3" data-bs-theme="auto" style={{ background: 'var(--color-base-green)'}}>
                <div className="d-flex justify-content-end gap-2 w-100">
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