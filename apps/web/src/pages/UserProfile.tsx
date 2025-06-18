import React from 'react';
import './UserProfile.css';

const UserProfile = () => {
  return (
    <div className="user-profile-container">
      <h1>Perfil de Usuario</h1>
      <p>Nombre: Juan Pérez</p>
      <p>Email: juan.perez@example.com</p>
      <p>Rol: Administrador</p>
      <button>Editar Perfil</button>
    </div>
  );
};

export default UserProfile;
