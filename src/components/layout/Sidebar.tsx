
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MenuItem {
  path: string;
  label: string;
  description: string;
  icon: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Determinar si el usuario es Administrador
  const isAdmin = user?.RolNombre?.toLowerCase() === 'administrador' || user?.RolID === 2;

  // Detectar modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
      setIsDarkMode(isDark);
    };

    checkDarkMode();
    
    // Observar cambios en el tema
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-bs-theme']
    });

    return () => observer.disconnect();
  }, []);

  // Definir secciones del menú basadas en el rol del usuario
  const allMenuSections: MenuSection[] = [
    {
      title: t('sidebar.sections.main'),
      items: [
        { path: '/', label: t('sidebar.menu.dashboard.label'), description: t('sidebar.menu.dashboard.description'), icon: 'bi-speedometer2' },
        { path: '/animales', label: t('sidebar.menu.animals.label'), description: t('sidebar.menu.animals.description'), icon: 'bi-diagram-3-fill' },
        { path: '/animales-detalle', label: t('sidebar.menu.animalsDetail.label'), description: t('sidebar.menu.animalsDetail.description'), icon: 'bi-list-columns-reverse' },
      ]
    },
    {
      title: t('sidebar.sections.management'),
      items: [
        { path: '/recordatorios', label: t('sidebar.menu.reminders.label'), description: t('sidebar.menu.reminders.description'), icon: 'bi-calendar-check' },
        { path: '/historial', label: t('sidebar.menu.history.label'), description: t('sidebar.menu.history.description'), icon: 'bi-heart-pulse' },
        // Ventas solo para Administrador
        ...(isAdmin ? [{ path: '/ventas', label: t('sidebar.menu.sales.label'), description: t('sidebar.menu.sales.description'), icon: 'bi-cash-coin' }] : []),
      ]
    },
    // Sección de Configuración solo para Administrador
    ...(isAdmin ? [{
      title: t('sidebar.sections.settings'),
      items: [
        { path: '/categorias', label: t('sidebar.menu.categories.label'), description: t('sidebar.menu.categories.description'), icon: 'bi-tags' },
        { path: '/estados', label: t('sidebar.menu.states.label'), description: t('sidebar.menu.states.description'), icon: 'bi-flag' },
        { path: '/roles', label: t('sidebar.menu.roles.label'), description: t('sidebar.menu.roles.description'), icon: 'bi-person-badge' },
        { path: '/usuarios', label: t('sidebar.menu.users.label'), description: t('sidebar.menu.users.description'), icon: 'bi-people' },
      ]
    }] : [])
  ];

  // Filtrar secciones vacías
  const menuSections = allMenuSections.filter(section => section.items.length > 0);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    // Para evitar que /animales-detalle active /animales
    if (path === '/animales') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    // Hacer scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Cerrar sidebar en móvil después de hacer clic
    if (window.innerWidth < 992) {
      onClose();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div 
        className={`offcanvas-lg offcanvas-start sidebar-ganado ${isOpen ? 'show' : ''}`} 
        tabIndex={-1}
        role="navigation"
        aria-label="Menú principal de navegación"
      >
        <div className="offcanvas-header border-bottom d-lg-none" style={{ background: 'var(--color-base-green)' }}>
          <h5 className="offcanvas-title text-white fw-bold d-flex align-items-center">
            <i className="bi bi-list-ul me-2" aria-hidden="true"></i>
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
          <nav className="nav flex-column" role="menubar">
            {menuSections.map((section) => (
              <div key={section.title} role="none">
                {/* Section header */}
                <div 
                  className="sidebar-section-header"
                  role="presentation"
                  aria-label={`Sección ${section.title}`}
                >
                  {section.title}
                </div>
                
                {/* Section items */}
                {section.items.map((item) => {
                  const isItemActive = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-link px-3 py-3 d-flex align-items-center ${
                        isItemActive ? 'active' : ''
                      }`}
                      onClick={handleLinkClick}
                      role="menuitem"
                      aria-current={isItemActive ? 'page' : undefined}
                      aria-label={`${item.label}: ${item.description}`}
                      tabIndex={0}
                    >
                      <i 
                        className={`${item.icon} me-3 fs-5`} 
                        aria-hidden="true"
                        style={{ 
                          color: isItemActive 
                            ? 'white' 
                            : isDarkMode 
                              ? 'var(--color-sage-gray)' 
                              : 'var(--color-slate)' 
                        }}
                      ></i>
                      <div className="d-flex flex-column flex-grow-1">
                        <span 
                          className="fw-semibold"
                          style={{ 
                            color: isItemActive 
                              ? 'white' 
                              : isDarkMode 
                                ? 'var(--sidebar-text)' 
                                : 'var(--sidebar-text)' 
                          }}
                        >
                          {item.label}
                        </span>
                        <small 
                          className={`${isItemActive ? 'text-white-50' : 'text-muted'}`}
                          style={{ 
                            color: isItemActive 
                              ? 'rgba(255, 255, 255, 0.7)' 
                              : isDarkMode 
                                ? 'var(--color-sage-gray)' 
                                : 'var(--color-slate)' 
                          }}
                        >
                          {item.description}
                        </small>
                      </div>
                      {isItemActive && (
                        <i 
                          className="bi bi-chevron-right fs-6" 
                          aria-hidden="true"
                          style={{ color: 'var(--color-gold)' }}
                        ></i>
                      )}
                    </Link>
                  );
                })}
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
