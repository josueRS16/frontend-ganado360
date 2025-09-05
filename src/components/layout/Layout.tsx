import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../ui/ToastContainer';

export function Layout() {
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

      <div className="border-top p-3 text-center bg-light">
          <div className="d-flex align-items-center justify-content-center mb-2">
            <span className="text-success me-2">🐄</span>
            <strong className="text-success">Ganado360</strong>
          </div>
          <small className="text-muted">
            Sistema de Gestión de Ganado
            <br />
            <span className="badge bg-success text-white">v1.0.0</span>
          </small>
        </div>
    </div>

    
  );
}
