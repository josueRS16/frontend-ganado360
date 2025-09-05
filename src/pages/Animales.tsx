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
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h2 mb-1 text-success">
{/*                 <span className="me-2">🐄</span>
 */}                Gestión de Animales
              </h1>
              <p className="text-muted mb-0">
                {isLoading ? 'Cargando...' : pagination ? `${pagination.totalCount} animales registrados` : `${animales.length} animales registrados`}
              </p>
            </div>
            <div className="d-flex gap-2">
             {/*  <button
                className="btn btn-outline-success"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="me-1">🔍</span>
                Filtros {hasActiveFilters && <span className="badge bg-success ms-1">{Object.keys(params).length}</span>}
              </button> */}
              <div className="bg-success p-2 rounded">
              <span className="fw-bold text-white">🔍 Filtros Aplicados: </span> <span className="fw-bold text-white">{Object.keys(params).length}</span>
              </div>
              <button className="btn btn-success" onClick={() => openModal()}>
               {/*  <span className="me-1 text-white">➕</span> */}
                <span className="fw-bold">Añadir</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {/* {showFilters && ( */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-success shadow-sm">
              <div className="card-header bg-success text-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0">
                    <span className="me-2">🔍</span>
                    Filtros de Búsqueda
                  </h6>
                  {hasActiveFilters && (
                    <button className="btn btn-sm btn-light" onClick={clearAllFilters}>
                      <span className="me-1">🗑️</span>
                      Limpiar Filtros
                    </button>
                  )}
                </div>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Categoría</label>
                    <select
                      className="form-select"
                      value={params.ID_Categoria || ''}
                      onChange={(e) => handleFilterChange('ID_Categoria', e.target.value ? Number(e.target.value) : undefined)}
                    >
                      <option value="">Todas las categorías</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                          {categoria.Tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Sexo</label>
                    <select
                      className="form-select"
                      value={params.Sexo || ''}
                      onChange={(e) => handleFilterChange('Sexo', e.target.value as "M" | "F" || undefined)}
                    >
                      <option value="">Todos</option>
                      <option value="M">Macho</option>
                      <option value="F">Hembra</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Fecha Ingreso Desde</label>
                    <input
                      type="date"
                      className="form-control"
                      value={params.fechaIngresoDesde || ''}
                      onChange={(e) => handleFilterChange('fechaIngresoDesde', e.target.value || undefined)}
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Fecha Ingreso Hasta</label>
                    <input
                      type="date"
                      className="form-control"
                      value={params.fechaIngresoHasta || ''}
                      onChange={(e) => handleFilterChange('fechaIngresoHasta', e.target.value || undefined)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      {/* )} */}

      {/* Results */}
      {isLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando animales...</span>
          </div>
        </div>
      ) : animales.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <h5 className="text-muted">No se encontraron animales</h5>
            <p className="text-muted">
              {hasActiveFilters 
                ? 'No hay animales que coincidan con los filtros aplicados.'
                : 'Aún no tienes animales registrados en el sistema.'
              }
            </p>
            {hasActiveFilters ? (
              <button className="btn btn-outline-primary" onClick={clearAllFilters}>
                Limpiar Filtros
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => openModal()}>
                Registrar Primer Animal
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row">
          <div className="col-12">
            <div className="card border-success shadow-sm">
              <div className="card-header bg-light border-bottom">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="card-title mb-0 text-success">
                    <span className="me-2">📋</span>
                    Lista de Animales
                  </h6>
                  <span className="badge bg-success fs-6">
                    {animales.length} {animales.length === 1 ? 'animal' : 'animales'}
                  </span>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-success">
                    <tr>
                      <th className="fw-semibold text-center">Nombre</th>
                      <th className="fw-semibold text-center">Categoría</th>
                      <th className="fw-semibold text-center">Sexo</th>
                      <th className="fw-semibold text-center">Raza</th>
                      <th className="fw-semibold text-center">Peso</th>
                      <th className="fw-semibold text-center">F. Nac.</th>
                      <th className="fw-semibold text-center">F. Ingreso</th>
                      <th className="fw-semibold text-center">Estado</th>
                      <th className="fw-semibold text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animales.map((animal) => (
                      <tr key={animal.ID_Animal} className="align-middle">
                        <td className="fw-medium text-center">
                            {/* <Link 
                            to={`/animales/${animal.ID_Animal}`}
                            className="text-decoration-none fw-semibold fw-medium"
                          > */}
                            {animal.Nombre}
                         {/*  </Link> */}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary fs-6">{animal.CategoriaTipo}</span>
                        </td>
                        <td className="text-center">
                          <span className={`badge fs-6 ${animal.Sexo === 'F' ? 'bg-success' : 'bg-info'}`}>
                            {animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                          </span>
                        </td>
                        <td className="fw-medium text-center">{animal.Raza}</td>
                        <td className="fw-medium">{animal.Peso} kg</td>
                        <td className="text-center">{new Date(animal.Fecha_Nacimiento).toLocaleDateString()}</td>
                        <td className="text-center">{new Date(animal.Fecha_Ingreso).toLocaleDateString()}</td>
                        <td className="text-center">
                          <div className="">
                            {animal.Esta_Preniada === 1 && (
                              <button 
                                className="btn btn-link p-0 text-decoration-none"
                                onClick={() => openPartoModal(animal)}
                                style={{ border: 'none', background: 'none' }}
                              >
                                <span className="badge bg-warning fs-6 text-black">
                                  <span className="me-1">🤱</span>
                                  Preñada
                                </span>
                              </button>
                            )}
                            {animal.Esta_Preniada === 0 && (
                              <span className="badge bg-light text-dark fs-6">
                                <span className="me-1">✅</span>
                                Activo
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => openDetallesModal(animal)}
                              title="Ver detalles"
                            >
                              <span className="me-1">👁️</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-warning"
                              onClick={() => openModal(animal)}
                              title="Editar"
                            >
                              <span className="me-1">✏️</span>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(animal)}
                              disabled={deleteMutation.isPending}
                              title="Eliminar"
                            >
                              <span className="me-1">🗑️</span>
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
      <div className="row">
        <div className="col-12">
          {/* <div className="card border-success shadow-sm">
            <div className="card-body"> */}
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
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <label htmlFor="itemsPerPage" className="form-label me-2 mb-0">
                      Mostrar:
                    </label>
                    <select
                      id="itemsPerPage"
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
                      value={currentParams.limit || 10}
                      onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="ms-2 text-muted">por página</span>
                  </div>
                  <div className="text-muted">
                    {isLoading ? 'Cargando...' : `${animales.length} resultados`}
                  </div>
                </div>
              )}
            {/* </div>
          </div> */}
        </div>
      </div>

      <AnimalForm
        animal={modalState.animal}
        isOpen={modalState.isOpen}
        onClose={closeModal}
      />

      {/* Modal de Fecha Estimada de Parto */}
      {partoModalState.isOpen && partoModalState.animal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-success shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <span className="me-2">🤱</span>
                  Fecha Estimada de Parto
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closePartoModal}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center">
                  <div className="mb-3">
                    <h6 className="text-muted">Animal:</h6>
                    <h5 className="text-success fw-bold">{partoModalState.animal.Nombre}</h5>
                  </div>
                  <div className="mb-3">
                    <h6 className="text-muted">Fecha Estimada de Parto:</h6>
                    <h4 className="text-primary fw-bold">
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
                    <div className="alert alert-info">
                      <small>
                        <strong>Días restantes:</strong> {
                          Math.ceil((new Date(partoModalState.animal.Fecha_Estimada_Parto!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                        } días
                      </small>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={closePartoModal}
                >
                  <span className="me-1">✅</span>
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
            <div className="modal-content border-success shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title">
                  <span className="me-2">🐄</span>
                  Detalles del Animal
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={closeDetallesModal}
                  aria-label="Cerrar"
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  {/* Información Básica */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-header bg-success text-white">
                        <h6 className="card-title mb-0">
                          <span className="me-2">📋</span>
                          Información Básica
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-semibold text-muted">Nombre:</label>
                            <p className="fw-bold text-success fs-5">{detallesModalState.animal.Nombre}</p>
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
                    <div className="card h-100 border-0 bg-light">
                      <div className="card-header bg-primary text-white">
                        <h6 className="card-title mb-0">
                          <span className="me-2">📅</span>
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
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={closeDetallesModal}
                >
                  <span className="me-1">❌</span>
                  Cerrar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={() => {
                    closeDetallesModal();
                    openModal(detallesModalState.animal);
                  }}
                >
                  <span className="me-1">✏️</span>
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