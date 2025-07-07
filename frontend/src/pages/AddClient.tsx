import React, { useState } from 'react';
import './AddClient.css';

const AddClient = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        alert('Cliente registrado exitosamente.');
        setFormData({ name: '', email: '', phone: '', address: '' });
      } else {
        alert('Error al registrar el cliente.');
      }
    } catch (error) {
      console.error('Error al registrar el cliente:', error);
    }
  };

  return (
    <div className="add-client-container">
      <h1>Registrar Nuevo Cliente</h1>
      <form onSubmit={handleSubmit} className="add-client-form">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nombre"
          required
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Correo Electrónico"
          required
        />
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Teléfono"
          required
        />
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Dirección"
          required
        />
        <button type="submit">Guardar Cliente</button>
      </form>
    </div>
  );
};

export default AddClient;
