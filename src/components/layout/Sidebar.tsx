
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { path: '/', label: 'Dashboard', description: 'Resumen general', icon: 'bi-speedometer2' },
        { path: '/animales', label: 'Animales', description: 'Gestión de ganado', icon: 'bi-diagram-3-fill' },
        { path: '/animales-detalle', label: 'Vista Detallada', description: 'Información completa', icon: 'bi-list-columns-reverse' },
      ]
    },
    {
      title: 'Gestión',
      items: [
        { path: '/recordatorios', label: 'Recordatorios', description: 'Próximas tareas', icon: 'bi-calendar-check' },
        { path: '/historial', label: 'Historial Médico', description: 'Eventos veterinarios', icon: 'bi-heart-pulse' },
        { path: '/ventas', label: 'Ventas', description: 'Registro de ventas', icon: 'bi-cash-coin' },
      ]
    },
    {
      title: 'Configuración',
      items: [
        { path: '/categorias', label: 'Categorías', description: 'Tipos de ganado', icon: 'bi-tags' },
        { path: '/estados', label: 'Estados', description: 'Estados del ganado', icon: 'bi-flag' },
        { path: '/roles', label: 'Roles', description: 'Roles de usuario', icon: 'bi-person-badge' },
        { path: '/usuarios', label: 'Usuarios', description: 'Gestión de usuarios', icon: 'bi-people' },
      ]
    }
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
      <div className={`offcanvas-lg offcanvas-start sidebar-ganado ${isOpen ? 'show' : ''}`} tabIndex={-1}>
        <div className="offcanvas-header border-bottom d-lg-none" style={{ background: 'var(--color-base-green)' }}>
          <h5 className="offcanvas-title text-white fw-bold d-flex align-items-center">
            <i className="bi bi-list-ul me-2"></i>
            Menú de Navegación
          </h5>
          <button
            type="button"
            className="btn-close btn-close-white"
            onClick={onClose}
            aria-label="Cerrar menú"
          />
        </div>

        <div className="offcanvas-body p-0">
          <nav className="nav flex-column">
            {menuSections.map((section) => (
              <div key={section.title}>
                {/* Section header */}
                <div className="sidebar-section-header">
                  {section.title}
                </div>
                
                {/* Section items */}
                {section.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link px-3 py-3 d-flex align-items-center ${
                      isActive(item.path) ? 'active' : ''
                    }`}
                    onClick={onClose}
                    aria-current={isActive(item.path) ? 'page' : undefined}
                  >
                    <i className={`${item.icon} me-3 fs-5`} aria-hidden="true"></i>
                    <div className="d-flex flex-column flex-grow-1">
                      <span className="fw-semibold">{item.label}</span>
                      <small className={`${isActive(item.path) ? 'text-white-50' : 'text-muted'}`}>
                        {item.description}
                      </small>
                    </div>
                    {isActive(item.path) && (
                      <i className="bi bi-chevron-right fs-6" aria-hidden="true"></i>
                    )}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="offcanvas-backdrop fade show d-lg-none" 
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Cerrar menú"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClose();
            }
          }}
        />
      )}
    </>
  );
}
