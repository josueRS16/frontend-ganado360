import { Link } from 'react-router-dom';
import { useAnimales } from '../hooks/useAnimales';
import { useCategorias } from '../hooks/useCategorias';
import { Breadcrumb } from '../components/ui/Breadcrumb';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'gold';
  to?: string;
}

function StatCard({ title, value, subtitle, icon, color = 'primary', to }: StatCardProps) {
  const getColorClasses = () => {
    const colorMap = {
      primary: 'text-primary',
      success: 'text-success', 
      warning: 'text-warning',
      info: 'text-info',
      gold: 'text-warning' // Gold usa warning de Bootstrap
    };
    return colorMap[color];
  };

  const content = (
    <div className="card kpi-card h-100">
      <div className="card-body text-center p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h6 className="card-title mb-0">{title}</h6>
          <i className={`${icon} fs-4 ${getColorClasses()}`} aria-hidden="true"></i>
        </div>
        <div className={`kpi-value ${getColorClasses()}`}>{value}</div>
        {subtitle && (
          <p className="kpi-subtitle">{subtitle}</p>
        )}
        {to && (
          <div className="mt-3">
            <i className="bi bi-arrow-right text-muted"></i>
          </div>
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
        <div className="spinner-border" style={{ color: 'var(--color-base-green)' }} role="status">
          <span className="visually-hidden">Cargando datos del sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Breadcrumb */}
      <Breadcrumb 
        items={[
          { label: 'Dashboard', active: true }
        ]} 
      />
      
      {/* Header */}
      <div className="row mb-5">
        <div className="col-12">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
            <div>
              <h1 className="h2 mb-2 d-flex align-items-center" style={{ color: 'var(--color-base-green)' }}>
                <i className="bi bi-speedometer2 me-3"></i>
                Dashboard Ejecutivo
              </h1>
              <p className="text-muted mb-0 fs-6">
                Resumen integral del sistema de gestión ganadera • Tiempo real
              </p>
            </div>
            <div className="d-flex flex-column flex-sm-row gap-2">
              <Link to="/animales" className="btn btn-gold fw-semibold">
                <i className="bi bi-diagram-3-fill me-2"></i>
                Gestionar Animales
              </Link>
              <Link to="/recordatorios" className="btn btn-outline-secondary">
                <i className="bi bi-calendar-check me-2"></i>
                Ver Recordatorios
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xxl-4 g-4 mb-5">
        <div className="col">
          <StatCard
            title="Total de Animales"
            value={totalAnimales}
            subtitle="Animales registrados en el sistema"
            icon="bi-diagram-3-fill"
            color="primary"
            to="/animales"
          />
        </div>
        <div className="col">
          <StatCard
            title="Hembras"
            value={hembras}
            subtitle={`${totalAnimales > 0 ? Math.round((hembras / totalAnimales) * 100) : 0}% del inventario total`}
            icon="bi-gender-female"
            color="success"
            to="/animales?Sexo=F"
          />
        </div>
        <div className="col">
          <StatCard
            title="Machos"
            value={machos}
            subtitle={`${totalAnimales > 0 ? Math.round((machos / totalAnimales) * 100) : 0}% del inventario total`}
            icon="bi-gender-male"
            color="info"
            to="/animales?Sexo=M"
          />
        </div>
        <div className="col">
          <StatCard
            title="Preñadas"
            value={animalesPreniadas}
            subtitle={`${hembras > 0 ? Math.round((animalesPreniadas / hembras) * 100) : 0}% de las hembras`}
            icon="bi-heart-fill"
            color="gold"
            to="/animales?Esta_Preniada=1"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Animals by Category Analysis */}
        <div className="col-lg-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pb-0">
              <div className="d-flex align-items-center justify-content-between">
                <h5 className="card-title mb-0 fw-semibold d-flex align-items-center">
                  <i className="bi bi-pie-chart-fill me-2" style={{ color: 'var(--color-base-green)' }}></i>
                  Distribución por Categoría
                </h5>
                <Link to="/categorias" className="btn btn-outline-secondary btn-sm">
                  <i className="bi bi-gear-fill me-1"></i>
                  Gestionar
                </Link>
              </div>
              <p className="text-muted small mb-0">Análisis del inventario ganadero</p>
            </div>
            <div className="card-body">
              {categorias.length > 0 ? (
                <div className="list-group list-group-flush">
                  {categorias.map((categoria) => {
                    const count = animalesPorCategoria[categoria.Tipo] || 0;
                    const percentage = totalAnimales > 0 ? (count / totalAnimales) * 100 : 0;
                    
                    return (
                      <div key={categoria.ID_Categoria} className="list-group-item px-0 border-start-0 border-end-0 py-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-1">
                              <i className="bi bi-tag-fill me-2 text-muted"></i>
                              <span className="fw-semibold">{categoria.Tipo}</span>
                            </div>
                            <small className="text-muted">{count} animales registrados</small>
                            <div className="progress mt-2" style={{ height: '6px' }}>
                              <div 
                                className="progress-bar" 
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: 'var(--color-tint1)'
                                }}
                                role="progressbar"
                                aria-valuenow={percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${categoria.Tipo}: ${percentage.toFixed(1)}%`}
                              ></div>
                            </div>
                          </div>
                          <div className="text-end ms-3">
                            <span className="badge rounded-pill px-3 py-2" style={{ 
                              backgroundColor: 'var(--color-sage-gray)', 
                              color: 'var(--color-charcoal)' 
                            }}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-tags display-1 text-muted mb-3"></i>
                  <h6 className="text-muted">No hay categorías registradas</h6>
                  <p className="text-muted small mb-3">Configure las categorías para organizar su ganado</p>
                  <Link to="/categorias" className="btn btn-gold">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crear Primera Categoría
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="col-lg-6">
          <div className="card h-100 border-0 shadow-sm">
            <div className="card-header bg-transparent border-0 pb-0">
              <h5 className="card-title mb-0 fw-semibold d-flex align-items-center">
                <i className="bi bi-lightning-fill me-2" style={{ color: 'var(--color-gold)' }}></i>
                Panel de Control Rápido
              </h5>
              <p className="text-muted small mb-0">Acceso directo a funciones principales</p>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                <Link to="/animales" className="btn btn-outline-primary text-start border-2 py-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="bi bi-diagram-3-fill fs-4 text-primary"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">Gestionar Animales</div>
                      <small className="text-muted">Ver, editar e ingresar información del ganado</small>
                    </div>
                    <div className="text-end">
                      <span className="badge bg-primary rounded-pill fs-6">{totalAnimales}</span>
                      <div><i className="bi bi-arrow-right text-muted small"></i></div>
                    </div>
                  </div>
                </Link>

                <Link to="/recordatorios" className="btn btn-outline-warning text-start border-2 py-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="bi bi-calendar-check fs-4 text-warning"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">Recordatorios</div>
                      <small className="text-muted">Próximas vacunas y tratamientos programados</small>
                    </div>
                    <div><i className="bi bi-arrow-right text-muted"></i></div>
                  </div>
                </Link>

                <Link to="/historial" className="btn btn-outline-info text-start border-2 py-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="bi bi-heart-pulse fs-4 text-info"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">Historial Veterinario</div>
                      <small className="text-muted">Registro completo de eventos médicos</small>
                    </div>
                    <div><i className="bi bi-arrow-right text-muted"></i></div>
                  </div>
                </Link>

                <Link to="/ventas" className="btn btn-outline-success text-start border-2 py-3">
                  <div className="d-flex align-items-center">
                    <div className="me-3">
                      <i className="bi bi-cash-coin fs-4 text-success"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-semibold">Ventas</div>
                      <small className="text-muted">Registro y seguimiento de transacciones</small>
                    </div>
                    <div><i className="bi bi-arrow-right text-muted"></i></div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informativa Link */}
      <div className="row mb-4">
        <div className="col-12 text-center">
          <Link to="/informativa" className="btn btn-outline-info">
            <i className="bi bi-info-circle me-2"></i>
            Sección Informativa
          </Link>
        </div>
      </div>
    </div>
  );
}
