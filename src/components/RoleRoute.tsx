import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { ReactNode } from 'react';

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
}

/**
 * Componente para proteger rutas basadas en roles de usuario
 * 
 * @example
 * <RoleRoute allowedRoles={['Administrador']}>
 *   <UsuariosPage />
 * </RoleRoute>
 */
export function RoleRoute({ children, allowedRoles, redirectTo = '/' }: RoleRouteProps) {
  const { user } = useAuth();

  // Verificar si el usuario tiene alguno de los roles permitidos
  // Primero verifica por RolNombre, luego por RolID como fallback
  const hasAccess = user && (
    (user.RolNombre && allowedRoles.includes(user.RolNombre)) ||
    (user.RolID === 2 && allowedRoles.includes('Administrador')) ||
    (user.RolID === 1 && allowedRoles.includes('Veterinario'))
  );

  if (!hasAccess) {
    // Redirigir al usuario a la página principal o a la ruta especificada
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}

