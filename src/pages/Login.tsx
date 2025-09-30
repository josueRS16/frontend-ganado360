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
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!correo || !contraseña) {
      setError('Por favor, complete todos los campos.');
      return;
    }
    try {
      const res = await authApi.login({ Correo: correo, Contraseña: contraseña });
      if (recordar) {
        localStorage.setItem('recordarCorreo', correo);
      } else {
        localStorage.removeItem('recordarCorreo');
      }
      login(res.data);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al iniciar sesión');
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
          value={contraseña}
          onChange={e => setContraseña(e.target.value)}
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
