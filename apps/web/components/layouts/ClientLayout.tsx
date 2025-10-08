import type { ReactNode } from 'react';
import React from 'react';

const ClientLayout: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  return (
    <div className="client-layout">
      {/* Aquí puedes agregar lógica de navegación, temas, etc. */}
      {children}
    </div>
  );
};

export default ClientLayout;
