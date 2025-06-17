import React from 'react';
import './MarketingLanding.css';

const MarketingLanding = () => {
  return (
    <div className="marketing-container">
      <h1>Bienvenido al Bot Administrativo</h1>
      <p>Automatiza tu gestión administrativa y optimiza tu tiempo.</p>
      <ul>
        <li>Seguridad avanzada con 2FA y autenticación biométrica.</li>
        <li>Integración con los principales bancos de España.</li>
        <li>Generación automática de reportes personalizados.</li>
      </ul>
      <button>Comienza tu prueba gratuita</button>
    </div>
  );
};

export default MarketingLanding;
