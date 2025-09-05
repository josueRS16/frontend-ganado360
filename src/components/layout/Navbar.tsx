
import { Link } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ onToggleSidebar, isDark, onToggleTheme }: NavbarProps) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-lg border-bottom border-success border-3">
      <div className="container-fluid">
        {/* Sidebar toggle button */}
        <button
          className="btn btn-outline-light d-lg-none me-3"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          ☰
        </button>

        {/* Brand */}
        <div className="navbar-brand d-flex align-items-center">
          <div className="bg-white rounded-circle p-2 me-3">
            <span className="text-success fw-bold fs-4">🐄</span>
          </div>
          <div>
            <Link className="text-white text-decoration-none" to="/">
              <div className="fw-bold fs-4">Ganado360</div>
              <small className="text-light opacity-75">Sistema de Gestión Ganadera</small>
            </Link>
          </div>
        </div>

        {/* Search form */}
        <form className="d-flex flex-grow-1 mx-3 d-none d-md-flex">
          <div className="input-group">
            <input
              className="form-control"
              type="search"
              placeholder="Buscar animales, recordatorios..."
              aria-label="Search"
            />
            <button className="btn btn-light" type="submit">
              🔍
            </button>
          </div>
        </form>

        {/* Right side actions */}
        <div className="d-flex align-items-center">
          {/* Status indicator */}
          <div className="me-3 d-none d-lg-block">
            <span className="badge bg-light text-success">
              <span className="badge bg-success rounded-pill me-1">●</span>
              Sistema Activo
            </span>
          </div>

          {/* Theme toggle */}
          <button
            className="btn btn-outline-light me-2"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Quick actions dropdown */}
          <div className="dropdown">
            <button
              className="btn btn-light dropdown-toggle fw-semibold"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Acciones Rápidas
            </button>
            <ul className="dropdown-menu dropdown-menu-end shadow">
              <li>
                <Link className="dropdown-item" to="/animales">
                  <span className="me-2">🐄</span>
                  Gestionar Animales
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/ventas">
                  <span className="me-2">💰</span>
                  Registrar Venta
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/recordatorios">
                  <span className="me-2">📅</span>
                  Ver Recordatorios
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li>
                <Link className="dropdown-item" to="/usuarios">
                  <span className="me-2">👥</span>
                  Gestionar Usuarios
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
}
