import { createContext } from 'react';
import type { Usuario } from '../types/api';

type UsuarioSesion = Partial<Pick<Usuario, 'ID_Usuario' | 'Nombre' | 'Correo' | 'RolID' | 'RolNombre'>> & { [key: string]: unknown };

export interface AuthContextType {
  user: UsuarioSesion | null;
  login: (user: UsuarioSesion) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
