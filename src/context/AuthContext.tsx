import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextInstance';

type UsuarioSesion = {
  Nombre?: string;
  Correo?: string;
  RolID?: number;
  [key: string]: unknown;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const login = (user: UsuarioSesion) => setUser(user);
  const logout = () => setUser(null);

  // Exponer función global para logout automático y redirección
  React.useEffect(() => {
    window.logoutApp = () => {
      logout();
      navigate('/login');
    };
    return () => { delete window.logoutApp; };
  }, [navigate]);
  const [user, setUser] = useState<UsuarioSesion | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

