
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', description: 'Resumen general', icon: '📊' },
    { path: '/animales', label: 'Animales', description: 'Gestión de ganado', icon: '🐄' },
    { path: '/animales-detalle', label: 'Animales con Detalle', description: 'Vista completa', icon: '📋' },
    { path: '/recordatorios', label: 'Recordatorios', description: 'Próximas tareas', icon: '📅' },
    { path: '/historial', label: 'Historial Veterinario', description: 'Eventos médicos', icon: '🏥' },
    { path: '/ventas', label: 'Ventas', description: 'Registro de ventas', icon: '💰' },
    { path: '/categorias', label: 'Categorías', description: 'Tipos de ganado', icon: '🏷️' },
    { path: '/estados', label: 'Estados', description: 'Estados del ganado', icon: '📊' },
    { path: '/roles', label: 'Roles', description: 'Roles de usuario', icon: '👤' },
    { path: '/usuarios', label: 'Usuarios', description: 'Gestión de usuarios', icon: '👥' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`offcanvas-lg offcanvas-start bg-white shadow-lg ${isOpen ? 'show' : ''}`} tabIndex={-1}>
        <div className="offcanvas-header border-bottom d-lg-none bg-success">
          <h5 className="offcanvas-title text-white fw-bold">Menú de Navegación</h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        <div className="offcanvas-body p-0">
          {/* Sidebar header for desktop */}
          {/* <div className="d-none d-lg-block p-3 bg-light border-bottom">
            <h6 className="text-success fw-bold mb-0">Navegación Principal</h6>
            <small className="text-muted">Sistema de Gestión Ganadera</small>
          </div> */}

          <nav className="nav flex-column">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link px-3 py-3 border-bottom d-flex align-items-center ${
                  isActive(item.path) 
                    ? 'active bg-success text-white' 
                    : 'text-dark hover-bg-light'
                }`}
                onClick={onClose}
                style={{ transition: 'all 0.2s ease' }}
              >
                <span className="me-3 fs-5">{item.icon}</span>
                <div className="d-flex flex-column">
                  <span className="fw-semibold">{item.label}</span>
                  <small className={`${isActive(item.path) ? 'text-white-50' : 'text-muted'}`}>
                    {item.description}
                  </small>
                </div>
              </Link>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        {/* <div className="border-top p-3 text-center bg-light">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <span className="text-success me-2">🐄</span>
            <strong className="text-success">Ganado360</strong>
          </div>
          <small className="text-muted">
            Sistema de Gestión de Ganado
            <br />
            <span className="badge bg-success text-white">v1.0.0</span>
          </small>
        </div> */}
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="offcanvas-backdrop fade show d-lg-none" 
          onClick={onClose}
        />
      )}
    </>
  );
}
