
// Extender el tipo Window para TypeScript
declare global {
  interface Window {
    updateNotificationCount?: () => void;
  }
}


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState, useRef, useCallback } from 'react';
import { recordatoriosApi } from '../../api/recordatorios';
import { PerfilUsuarioModal } from '../modals/PerfilUsuarioModal';
import '../../styles/google-popover.css';

interface NavbarProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ onToggleSidebar, isDark, onToggleTheme }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notiCount, setNotiCount] = useState(0);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLButtonElement>(null);
  const popoverContainerRef = useRef<HTMLDivElement>(null);

  // Función para obtener las iniciales del usuario
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  // Función para abrir el modal de perfil desde el popover
  const handleEditProfile = useCallback(() => {
    setShowPopover(false);
    setShowPerfilModal(true);
  }, []);

  // Función para toggle del popover
  const togglePopover = useCallback(() => {
    setShowPopover(prev => !prev);
  }, []);

  // Cerrar popover al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverContainerRef.current && !popoverContainerRef.current.contains(event.target as Node)) {
        setShowPopover(false);
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPopover]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
  const res = await recordatoriosApi.getAll({ Estado: 'pendiente' });
  // res: PaginatedResponse<Recordatorio[]>
  setNotiCount(Array.isArray(res.data) ? res.data.length : 0);
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

          {/* User profile popover */}
          <div className="position-relative" ref={popoverContainerRef}>
            <button
              ref={popoverRef}
              className="popover-trigger-btn"
              type="button"
              onClick={togglePopover}
              aria-label="Menú de perfil de usuario"
            >
              <div className="user-avatar-small">
                {getUserInitials(user?.Nombre || 'U')}
              </div>
              <span className="user-name d-none d-lg-inline">{user?.Nombre || 'Usuario'}</span>
              <i className="bi bi-chevron-down fs-6"></i>
            </button>

            {/* Popover personalizado */}
            {showPopover && (
              <div className="google-popover position-absolute end-0 mt-2" style={{ zIndex: 1050 }}>
                <div className="google-popover-header">
                  <div className="d-flex align-items-center">
                    <div className="user-avatar">
                      {getUserInitials(user?.Nombre || 'U')}
                    </div>
                    <div className="user-info">
                      <h6>{user?.Nombre || 'Usuario'}</h6>
                      <div className="user-email">{user?.Correo || 'correo@ejemplo.com'}</div>
                      <span className="user-role-badge">
                        <i className="bi bi-shield-check"></i>
                        {user?.RolNombre || 'Usuario'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="google-popover-body">
                  <button 
                    className="popover-action-btn" 
                    onClick={handleEditProfile}
                  >
                    <i className="bi bi-pencil-square"></i>
                    Editar perfil
                  </button>
                  <hr className="popover-separator" />
                  <button 
                    className="popover-action-btn logout-btn" 
                    onClick={handleLogout}
                  >
                    <i className="bi bi-box-arrow-right"></i>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Modal de perfil */}
          <PerfilUsuarioModal 
            isOpen={showPerfilModal} 
            onClose={() => setShowPerfilModal(false)} 
          />
        </div>
      </div>
    </nav>
  );
}
