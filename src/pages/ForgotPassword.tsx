import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, { correo: email });
      console.log('Respuesta del servidor:', response.data);
      setMessage(response.data.message);
      setShowCodeInput(true); // Muestra el formulario para ingresar el código
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar el correo.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-code`, { correo: email, code });
      console.log('Código verificado:', response.data);
      setMessage('Código verificado correctamente.');
      setShowPasswordInput(true); // Muestra el formulario para cambiar la contraseña
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar el código.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { correo: email, code, newPassword });
      console.log('Contraseña cambiada:', response.data);
      setMessage('Contraseña cambiada exitosamente.');
      setShowPasswordInput(false);
      setTimeout(() => navigate('/login'), 2000); // Redirige al login después de 2 segundos
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña.');
    }
  };

  return (
    <div className="login-background">
      <div className="login-form">
        <h2>Recuperar contraseña</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Enviar Código</button>
        </form>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="login-error">{error}</p>}

        {showCodeInput && !showPasswordInput && (
          <form onSubmit={handleVerifyCode}>
            <label htmlFor="code">Código de Verificación:</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <button type="submit">Verificar Código</button>
          </form>
        )}

        {showPasswordInput && (
          <form onSubmit={handleChangePassword}>
            <label htmlFor="newPassword">Nueva Contraseña:</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit">Cambiar Contraseña</button>
          </form>
        )}
        <p><a href="/login">Volver al inicio</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
