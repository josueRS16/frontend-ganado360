import React from 'react';

const ForgotPassword: React.FC = () => {
  return (
    <div className="login-bg">
      <div className="login-form">
        <h2>Recuperar contraseña</h2>
        <p>La funcionalidad de recuperación de contraseña fue removida. Por favor contacte al administrador o use su cuenta existente.</p>
        <p><a href="/login">Volver al inicio</a></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
