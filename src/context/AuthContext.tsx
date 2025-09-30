import { useNavigate } from 'react-router-dom';
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types/api';

type UsuarioSesion = Partial<Pick<Usuario, 'Nombre' | 'Correo' | 'RolID'>> & { [key: string]: any };
interface AuthContextType {
  user: UsuarioSesion | null;
  login: (user: UsuarioSesion) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  // Exponer función global para logout automático y redirección
  React.useEffect(() => {
    window.logoutApp = () => {
      logout();
      navigate('/login');
    };
    return () => { delete window.logoutApp; };
  }, []);
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

  const login = (user: UsuarioSesion) => setUser(user);
  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
