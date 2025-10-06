import React, { useState } from 'react';
import axios from 'axios';

const VerifyCode: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-code`, { correo: email, code });
      console.log('Respuesta del servidor:', response.data);
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al verificar el código.');
    }
  };

  return (
    <div className="verify-code">
      <h1>Verificar Código</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Correo Electrónico:</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
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
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default VerifyCode;