// Extender window para logoutApp
declare global {
  interface Window {
    logoutApp?: () => void;
  }
}
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/ToastContainer';

export function Layout() {
  // Cierre de sesión automático tras 1 minuto de inactividad
  useEffect(() => {
  let timeoutId: number;
    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        // Cerrar sesión si existe función global
        if (window.logoutApp) window.logoutApp();
      }, 600000); // 10 minutos
    };
    // Eventos de actividad
    ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    resetTimer();
    return () => {
      clearTimeout(timeoutId);
      ['mousemove', 'keydown', 'mousedown', 'touchstart'].forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);



  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    
    setIsDark(shouldUseDark);
    document.documentElement.setAttribute('data-bs-theme', shouldUseDark ? 'dark' : 'light');
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.setAttribute('data-bs-theme', newTheme ? 'dark' : 'light');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  return (
    <div className="d-flex flex-column">
      <Navbar 
        onToggleSidebar={toggleSidebar}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
      
      <div className="flex-grow-1 d-flex">
        <Sidebar 
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        
        <main className="flex-grow-1 p-3 p-lg-4">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>

      <ToastContainer />

      <footer className="footer-ganado mt-auto">
        <div className="container-fluid px-4 py-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-clipboard-data-fill me-2 fs-5"></i>
              <div>
                <strong className="fw-bold">Ganado360</strong>
                <div className="small opacity-75">Sistema de Gestión Ganadera</div>
              </div>
            </div>
            
            <div className="d-flex flex-column flex-sm-row align-items-center gap-3 small">
              <div className="d-flex align-items-center gap-2">
                <span className="badge" style={{ background: 'var(--color-tint1)' }}>v1.0.0</span>
                <span className="opacity-75">•</span>
                <span className="opacity-75">© 2024</span>
              </div>
              
              <div className="d-flex gap-3">
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-question-circle me-1"></i>
                  Soporte
                </a>
                <a href="#" className="text-decoration-none">
                  <i className="bi bi-book me-1"></i>
                  Documentación
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>

    
  );
}
