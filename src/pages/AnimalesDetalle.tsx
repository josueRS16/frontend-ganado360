import { useState } from 'react';
import { useAnimalesConDetalle } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { useQueryParams } from '../hooks/useQueryParams';
import type { AnimalesFilters } from '../types/api';

export function AnimalesDetalle() {
  const { params, updateParams, clearParams } = useQueryParams<AnimalesFilters>();
  const { data: animalesData, isLoading, error } = useAnimalesConDetalle();
  const { data: categoriasData } = useCategorias();

  const animales = animalesData?.data || [];
  const categorias = categoriasData?.data || [];

  const [showFilters, setShowFilters] = useState(false);

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
    setShowFilters(false);
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
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h2 mb-1">Animales con Detalle</h1>
          <p className="text-muted mb-0">
            Vista completa de todos los animales con información detallada
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros {hasActiveFilters && <span className="badge bg-primary ms-1">{Object.keys(params).length}</span>}
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card mb-4">
          <div className="card-header">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">Filtros de Búsqueda</h6>
              {hasActiveFilters && (
                <button className="btn btn-sm btn-outline-secondary" onClick={clearAllFilters}>
                  Limpiar Filtros
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Categoría</label>
                <select
                  className="form-select"
                  value={params.ID_Categoria || ''}
                  onChange={(e) => handleFilterChange('ID_Categoria', e.target.value ? Number(e.target.value) : undefined)}
                >
                  <option value="">Todas las categorías</option>
                  {categorias.map(categoria => (
                    <option key={categoria.ID_Categoria} value={categoria.ID_Categoria}>
                      {categoria.Tipo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Sexo</label>
                <select
                  className="form-select"
                  value={params.Sexo || ''}
                  onChange={(e) => handleFilterChange('Sexo', e.target.value || undefined)}
                >
                  <option value="">Todos</option>
                  <option value="Macho">Macho</option>
                  <option value="Hembra">Hembra</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha Ingreso Desde</label>
                <input
                  type="date"
                  className="form-control"
                  value={params.fechaIngresoDesde || ''}
                  onChange={(e) => handleFilterChange('fechaIngresoDesde', e.target.value || undefined)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label">Fecha Ingreso Hasta</label>
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
      )}

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
              <a href="/animales" className="btn btn-primary">
                Ir a Gestión de Animales
              </a>
            )}
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Sexo</th>
                  <th>Raza</th>
                  <th>Color</th>
                  <th>Peso</th>
                  <th>Fecha Nacimiento</th>
                  <th>Fecha Ingreso</th>
                  <th>Estado Reproductivo</th>
                  <th>Fecha Monta</th>
                  <th>Fecha Estimada Parto</th>
                </tr>
              </thead>
              <tbody>
                {animales.map((animal) => (
                  <tr key={animal.ID_Animal}>
                    <td>{animal.ID_Animal}</td>
                    <td className="fw-semibold">{animal.Nombre}</td>
                    <td>
                      <span className="badge bg-secondary">{animal.CategoriaTipo}</span>
                    </td>
                    <td>
                      <span className={`badge ${animal.Sexo === 'Hembra' ? 'bg-success' : 'bg-info'}`}>
                        {animal.Sexo}
                      </span>
                    </td>
                    <td>{animal.Raza}</td>
                    <td>{animal.Color}</td>
                    <td>{animal.Peso}</td>
                    <td>{new Date(animal.Fecha_Nacimiento).toLocaleDateString()}</td>
                    <td>{new Date(animal.Fecha_Ingreso).toLocaleDateString()}</td>
                    <td>
                      {animal.Esta_Preniada === 1 ? (
                        <span className="badge bg-warning">Preñada</span>
                      ) : (
                        <span className="badge bg-light text-dark">No preñada</span>
                      )}
                    </td>
                    <td>
                      {animal.Fecha_Monta ? new Date(animal.Fecha_Monta).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      {animal.Fecha_Estimada_Parto ? new Date(animal.Fecha_Estimada_Parto).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
