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
import { useTranslation } from 'react-i18next';
import { USFlag } from '../icons/USFlag';
import { CRFlag } from '../icons/CRFlag';


interface NavbarProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ onToggleSidebar, isDark, onToggleTheme }: NavbarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notiCount, setNotiCount] = useState(0);
  const { i18n, t } = useTranslation();
  const cambiarIdioma = async () => {
    const next = i18n.language === 'es' ? 'en' : 'es';
    try {
      await i18n.changeLanguage(next);
      localStorage.setItem('app_lang', next);
      document.documentElement.lang = next;
    } catch (e) {
      console.error('Error cambiando idioma', e);
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mantener el lang del documento sincronizado si cambia desde otro sitio
  useEffect(() => {
    if (document.documentElement.lang !== i18n.language) {
      document.documentElement.lang = i18n.language;
    }
  }, [i18n.language]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-ganado">
      <div className="container-fluid px-lg-4">
        {/* Sidebar toggle button */}
        <button
          className="btn btn-outline-light d-lg-none me-3 border-0"
          type="button"
          onClick={onToggleSidebar}
          aria-label={t('abrir_menu')}
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
              <div className="fw-bold fs-4 lh-1">{t('app_name')}</div>
              <small className="text-light fw-normal">{t('app_subtitle')}</small>
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
              title={t('recordatorios')}
              onClick={() => navigate('/recordatorios')}
            >
              <i className="bi bi-bell-fill"></i>
              {notiCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notiCount}
                  <span className="visually-hidden">{t('recordatorios')}</span>
                </span>
              )}
            </button>
          </div>

          {/* Botón de idioma con SVG */}
          <button
  className="btn btn-outline-light border-0 d-flex align-items-center"
  onClick={cambiarIdioma}
  aria-label={i18n.language === 'es' ? t('cambiar_a_ingles') : t('cambiar_a_espanol')}
  title={i18n.language === 'es' ? t('cambiar_a_ingles') : t('cambiar_a_espanol')}
  style={{ padding: '0.15rem 0.4rem' }}
>
  {i18n.language === 'es' ? (
    <USFlag style={{ display: 'block' }} />
  ) : (
    <CRFlag style={{ display: 'block' }} />
  )}
  <span className="visually-hidden">
    {i18n.language === 'es' ? t('cambiar_a_ingles') : t('cambiar_a_espanol')}
  </span>
</button>

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
              aria-label={t('acciones_rapidas')}
            >
              <i className="bi bi-lightning-fill me-1"></i>
              <span className="d-none d-lg-inline">{t('acciones_rapidas')}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style={{ minWidth: '240px' }}>
              <li className="dropdown-header fw-semibold text-muted">
                <i className="bi bi-lightning me-1"></i>
                {t('acciones_rapidas')}
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <Link className="dropdown-item py-2" to="/animales">
                  <i className="bi bi-diagram-3-fill me-2 text-primary"></i>
                  {t('gestionar_animales')}
                  <small className="d-block text-muted">{t('ver_y_editar_ganado')}</small>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to="/ventas">
                  <i className="bi bi-cash-coin me-2 text-warning"></i>
                  {t('registrar_venta')}
                  <small className="d-block text-muted">{t('nueva_transaccion')}</small>
                </Link>
              </li>
              <li>
                <Link className="dropdown-item py-2" to="/recordatorios">
                  <i className="bi bi-calendar-check me-2 text-info"></i>
                  {t('ver_recordatorios')}
                  <small className="d-block text-muted">{t('proximas_tareas')}</small>
                </Link>
              </li>
              <li><hr className="dropdown-divider my-1" /></li>
              <li>
                <Link className="dropdown-item py-2" to="/usuarios">
                  <i className="bi bi-people-fill me-2 text-secondary"></i>
                  {t('gestionar_usuarios')}
                  <small className="d-block text-muted">{t('administracion')}</small>
                </Link>
              </li>
              <li>
                <Link to="/informativa" aria-label={t('acerca_de_nosotros')} title={t('acerca_de_nosotros')} className="dropdown-item py-2">
                  <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span role="img" aria-label="vaca">🐄</span>
                    <span>{t('acerca_de_nosotros')}</span>
                  </span>
                </Link>
              </li>
              {user && (
                <>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      className="dropdown-item py-2 text-danger"
                      onClick={handleLogout}
                      aria-label={t('cerrar_sesion')}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i>
                      {t('cerrar_sesion')}
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
