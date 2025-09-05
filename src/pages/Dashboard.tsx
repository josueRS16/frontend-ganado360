
import { Link } from 'react-router-dom';
import { useAnimales } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  to?: string;
}

function StatCard({ title, value, subtitle, variant = 'primary', to }: StatCardProps) {
  const content = (
    <div className={`card h-100 border-${variant}`}>
      <div className="card-body text-center">
        <h5 className={`card-title text-${variant}`}>{title}</h5>
        <h2 className={`card-text display-6 fw-bold text-${variant}`}>{value}</h2>
        {subtitle && (
          <p className="card-text">
            <small className="text-muted">{subtitle}</small>
          </p>
        )}
      </div>
    </div>
  );

  return to ? (
    <Link to={to} className="text-decoration-none">
      {content}
    </Link>
  ) : content;
}

export function Dashboard() {
  const { data: animalesData, isLoading: loadingAnimales } = useAnimales();
  const { data: categoriasData, isLoading: loadingCategorias } = useCategorias();

  const animales = animalesData?.data || [];
  const categorias = categoriasData?.data || [];

  // Calcular estadísticas
  const totalAnimales = animales.length;
  const animalesPorSexo = animales.reduce((acc: Record<string, number>, animal) => {
    acc[animal.Sexo] = (acc[animal.Sexo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hembras = animalesPorSexo.F || 0;
  const machos = animalesPorSexo.M || 0;

  const animalesPreniadas = animales.filter(animal => animal.Esta_Preniada === 1).length;

  const animalesPorCategoria = animales.reduce((acc: Record<string, number>, animal) => {
    acc[animal.CategoriaTipo] = (acc[animal.CategoriaTipo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loadingAnimales || loadingCategorias) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
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
                <span className="me-2">📊</span>
                Dashboard
              </h1>
              <p className="text-muted mb-0">Resumen general del sistema de gestión de ganado</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/animales" className="btn btn-success">
                <span className="me-1">🐄</span>
                Gestionar Animales
              </Link>
              <Link to="/recordatorios" className="btn btn-outline-success">
                <span className="me-1">📅</span>
                Ver Recordatorios
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <StatCard
            title="Total Animales"
            value={totalAnimales}
            subtitle="Animales registrados"
            variant="primary"
            to="/animales"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Hembras"
            value={hembras}
            subtitle={`${totalAnimales > 0 ? Math.round((hembras / totalAnimales) * 100) : 0}% del total`}
            variant="success"
            to="/animales?Sexo=F"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Machos"
            value={machos}
            subtitle={`${totalAnimales > 0 ? Math.round((machos / totalAnimales) * 100) : 0}% del total`}
            variant="info"
            to="/animales?Sexo=M"
          />
        </div>
        <div className="col-md-3">
          <StatCard
            title="Preñadas"
            value={animalesPreniadas}
            subtitle={`${hembras > 0 ? Math.round((animalesPreniadas / hembras) * 100) : 0}% de hembras`}
            variant="warning"
            to="/animales?Esta_Preniada=1"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Animals by Category Chart */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Animales por Categoría</h5>
            </div>
            <div className="card-body">
              {categorias.length > 0 ? (
                <div className="list-group list-group-flush">
                  {categorias.map((categoria) => {
                    const count = animalesPorCategoria[categoria.Tipo] || 0;
                    const percentage = totalAnimales > 0 ? (count / totalAnimales) * 100 : 0;
                    
                    return (
                      <div key={categoria.ID_Categoria} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <span className="fw-semibold">{categoria.Tipo}</span>
                          <br />
                          <small className="text-muted">{count} animales</small>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-primary rounded-pill">{percentage.toFixed(1)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <p>No hay categorías registradas</p>
                  <Link to="/categorias" className="btn btn-outline-primary btn-sm">
                    Crear Categoría
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-6">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="card-title mb-0">Acciones Rápidas</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <Link to="/animales" className="btn btn-outline-primary text-start">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Gestionar Animales</div>
                      <small className="text-muted">Ver y editar información del ganado</small>
                    </div>
                    <span className="badge bg-primary">{totalAnimales}</span>
                  </div>
                </Link>

                <Link to="/recordatorios" className="btn btn-outline-warning text-start">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Recordatorios</div>
                      <small className="text-muted">Próximas vacunas y tratamientos</small>
                    </div>
                  </div>
                </Link>

                <Link to="/historial" className="btn btn-outline-info text-start">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Historial Veterinario</div>
                      <small className="text-muted">Registro de eventos médicos</small>
                    </div>
                  </div>
                </Link>

                <Link to="/ventas" className="btn btn-outline-success text-start">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold">Ventas</div>
                      <small className="text-muted">Registro y seguimiento de ventas</small>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent animals */}
      {/* {animales.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Animales Recientes</h5>
                <Link to="/animales" className="btn btn-sm btn-outline-primary">
                  Ver Todos
                </Link>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Sexo</th>
                        <th>Fecha Ingreso</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animales.slice(0, 5).map((animal) => (
                        <tr key={animal.ID_Animal}>
                          <td>
                            <Link 
                              to={`/animales/${animal.ID_Animal}`}
                              className="text-decoration-none fw-semibold"
                            >
                              {animal.Nombre}
                            </Link>
                          </td>
                          <td>
                            <span className="badge bg-secondary">{animal.CategoriaTipo}</span>
                          </td>
                          <td>
                            <span className={`badge ${animal.Sexo === 'F' ? 'bg-success' : 'bg-info'}`}>
                              {animal.Sexo === 'F' ? 'Hembra' : 'Macho'}
                            </span>
                          </td>
                          <td>{new Date(animal.Fecha_Ingreso).toLocaleDateString()}</td>
                          <td>
                            {animal.Esta_Preniada === 1 && (
                              <span className="badge bg-warning">Preñada</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
}
