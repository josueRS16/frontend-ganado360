import React, { useState, useEffect } from 'react';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginRegister.css';

const Login: React.FC = () => {
  const [correo, setCorreo] = useState('');
  const [recordar, setRecordar] = useState(false);
  // Al cargar, recuperar correo si está guardado
  useEffect(() => {
    const savedCorreo = localStorage.getItem('recordarCorreo');
    if (savedCorreo) {
      setCorreo(savedCorreo);
      setRecordar(true);
    }
  }, []);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
        login({ Nombre: res.nombre, RolID: res.rol, Correo: correo });
        navigate('/');
      } else {
        setError('Respuesta inválida del servidor.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Error al iniciar sesión';
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
    <div className="login-bg">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
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
      </form>
    </div>
  );
};

export default Login;
