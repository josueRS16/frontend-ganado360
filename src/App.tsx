import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from './context/ToastContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Animales } from './pages/Animales';
import { AnimalesDetalle } from './pages/AnimalesDetalle';
import { Categorias } from './pages/Categorias';
import { Roles } from './pages/Roles';
import { Usuarios } from './pages/Usuarios';
import { Estados } from './pages/Estados';
import { Recordatorios } from './pages/Recordatorios';
import { Historial } from './pages/Historial';
import { Ventas } from './pages/Ventas';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';
import { RoleRoute } from './components/RoleRoute';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyCode from './pages/VerifyCode';

// Crear QueryClient con configuración optimizada
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <CurrencyProvider>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          {/* Password reset routes removed */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              {/* Rutas accesibles para todos los usuarios autenticados */}
              <Route index element={<Dashboard />} />
              <Route path="animales" element={<Animales />} />
              <Route path="animales-detalle" element={<AnimalesDetalle />} />
              <Route path="recordatorios" element={<Recordatorios />} />
              <Route path="historial" element={<Historial />} />
              
              {/* Rutas solo para Administradores */}
              <Route path="ventas" element={
                <RoleRoute allowedRoles={['Administrador']}>
                  <Ventas />
                </RoleRoute>
              } />
              <Route path="categorias" element={
                <RoleRoute allowedRoles={['Administrador']}>
                  <Categorias />
                </RoleRoute>
              } />
              <Route path="roles" element={
                <RoleRoute allowedRoles={['Administrador']}>
                  <Roles />
                </RoleRoute>
              } />
              <Route path="usuarios" element={
                <RoleRoute allowedRoles={['Administrador']}>
                  <Usuarios />
                </RoleRoute>
              } />
              <Route path="estados" element={
                <RoleRoute allowedRoles={['Administrador']}>
                  <Estados />
                </RoleRoute>
              } />
              <Route path="*" element={
                <div className="text-center py-5">
                  <h1 className="display-1">404</h1>
                  <p className="fs-3"><span className="text-danger">Oops!</span> Página no encontrada.</p>
                  <p className="fs-5">La página que buscas no existe.</p>
                  <a href="/" className="btn btn-primary">Ir al Dashboard</a>
                </div>
              } />
            </Route>
          </Route>
          </Routes>
        </CurrencyProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
