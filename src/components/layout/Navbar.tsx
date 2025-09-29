
// Extender el tipo Window para TypeScript
declare global {
  interface Window {
    updateNotificationCount?: () => void;
  }
}


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { recordatoriosApi } from '../../api/recordatorios';

interface NavbarProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ onToggleSidebar, isDark, onToggleTheme }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notiCount, setNotiCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await recordatoriosApi.getAll({ Estado: 'pendiente' });
        setNotiCount(res.data.length);
      } catch {
        setNotiCount(0);
      }
    };
    fetchCount();
    // Exponer función global para refrescar el contador desde cualquier parte
    window.updateNotificationCount = fetchCount;
    const interval = setInterval(fetchCount, 30000); // 30 segundos
    return () => {
      clearInterval(interval);
      delete window.updateNotificationCount;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-ganado">
      <div className="container-fluid px-lg-4">
        {/* Sidebar toggle button */}
        <button
          className="btn btn-outline-light d-lg-none me-3 border-0"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Abrir menú de navegación"
        >
          <i className="bi bi-list fs-5"></i>
        </button>

        {/* Brand */}
        <div className="navbar-brand d-flex align-items-center mb-0">
          <div className="bg-white rounded-2 p-2 me-3 shadow-sm">
            <i className="bi bi-clipboard-data-fill text-success fs-4"></i>
          </div>
          <div>
            <Link className="text-white text-decoration-none" to="/">
              <div className="fw-bold fs-4 lh-1">Ganado360</div>
              <small className="text-light fw-normal">Sistema de Gestión Ganadera</small>
            </Link>
          </div>
  </div>

  {/* Right side actions */}
  <div className="d-flex align-items-center gap-2">

          {/* Notificación de recordatorios automáticos */}
          <div className="me-2 position-relative">
            <button
              className="btn btn-outline-light border-0 position-relative"
              style={{ fontSize: '1.5rem' }}
              title="Recordatorios"
              onClick={() => navigate('/recordatorios')}
            >
              <i className="bi bi-bell-fill"></i>
              {notiCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notiCount}
                  <span className="visually-hidden">recordatorios</span>
                </span>
              )}
            </button>
          </div>

          {/* Theme toggle */}
          <button
            className="btn btn-outline-light border-0"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            <i className={`bi ${isDark ? 'bi-sun-fill' : 'bi-moon-fill'} fs-5`}></i>
          </button>

          {/* Quick actions dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-gold dropdown-toggle fw-semibold px-3"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Menú de acciones rápidas"
            >
              <i className="bi bi-lightning-fill me-1"></i>
              <span className="d-none d-lg-inline">Acciones</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style={{ minWidth: '240px' }}>
              <li className="dropdown-header fw-semibold text-muted">
                <i className="bi bi-lightning me-1"></i>
                Acciones Rápidas
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <Link className="dropdown-item py-2" to="/animales">
                  <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
                  Gestionar Animales
                  <small className="d-block text-muted">Ver y editar ganado</small>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to="/ventas">
                  <i className="bi bi-cash-coin me-2 text-warning"></i>
                  Registrar Venta
                  <small className="d-block text-muted">Nueva transacción</small>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to="/recordatorios">
                  <i className="bi bi-calendar-check me-2 text-info"></i>
                  Ver Recordatorios
                  <small className="d-block text-muted">Próximas tareas</small>
                </Link>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <Link className="dropdown-item py-2" to="/usuarios">
                  <i className="bi bi-people-fill me-2 text-secondary"></i>
                  Gestionar Usuarios
                  <small className="d-block text-muted">Administración</small>
                </Link>
              </li>
              {user && (
                <>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 text-danger"
                      onClick={handleLogout}
                      aria-label="Cerrar sesión"
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      Cerrar sesión
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
