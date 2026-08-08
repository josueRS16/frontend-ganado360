import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { useTranslation } from 'react-i18next';
import './LoginRegister.css';

const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  // Al cargar, recuperar correo si está guardado
  useEffect(() => {
    const savedCorreo = localStorage.getItem('recordarCorreo');
    if (savedCorreo) {
      setCorreo(savedCorreo);
      setRecordar(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!correo || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    }

    try {
      const res = await authApi.login({ correo, password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (recordar) {
          localStorage.setItem('recordarCorreo', correo);
        } else {
          localStorage.removeItem('recordarCorreo');
        }
        
        // Obtener el perfil completo del usuario
        let userName = res.nombre || correo;
        try {
          const profileResponse = await authApi.getProfile();
          userName = profileResponse.data.Nombre || userName;
          // Guardar todos los datos del usuario en el contexto
          login({ 
            ID_Usuario: profileResponse.data.ID_Usuario,
            Nombre: profileResponse.data.Nombre, 
            RolID: profileResponse.data.RolID, 
            RolNombre: profileResponse.data.RolNombre,
            Correo: profileResponse.data.Correo 
          });
        } catch {
          // Fallback si falla el perfil, usar datos del login
          login({ 
            ID_Usuario: res.id || res.ID_Usuario,
            Nombre: res.nombre, 
            RolID: res.rol, 
            RolNombre: res.rolNombre || res.RolNombre,
            Correo: correo 
          });
        }

        showToast(t('auth.messages.welcome', { user: userName }), 'success');
        navigate('/');
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Error al iniciar sesión';
      if (msg.includes('Correo o contraseña incorrectos')) {
        setError('Correo o contraseña incorrectos.');
      } else if (msg.includes('Correo y contraseña requeridos')) {
        setError('Por favor, complete todos los campos.');
      } else {
        setError(msg);
      }
    }
  };

  return (
  <div className="login-background">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <p>Correo: test@gmail.com</p>
        <p>Contraseña: 1234</p>
        {error && <div className="error-message">{error}</div>}
        <input
          type="email"
          placeholder="Correo"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <input
            type="checkbox"
            id="recordar"
            checked={recordar}
            onChange={e => setRecordar(e.target.checked)}
            style={{ marginRight: 8 }}
          />
          <label htmlFor="recordar">Recordar usuario</label>
        </div>
        <button type="submit">Entrar</button>
        <p>¿No tienes cuenta? <a href="/register">Regístrate</a></p>
        <p>¿Olvidaste tu contraseña? <a href="/forgot-password">Recupérala aquí</a></p>
      </form>
    </div>
  );
};

export default Login;
