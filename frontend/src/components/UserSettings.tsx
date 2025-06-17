import React, { useState } from 'react';
import './UserSettings.css';

const UserSettings = () => {
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  const handleNotificationsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNotifications(e.target.checked);
  };

  return (
    <div className="user-settings-container">
      <h1>Configuración de Usuario</h1>
      <div className="setting">
        <label htmlFor="theme">Tema:</label>
        <select id="theme" value={theme} onChange={handleThemeChange}>
          <option value="light">Claro</option>
          <option value="dark">Oscuro</option>
        </select>
      </div>
      <div className="setting">
        <label htmlFor="notifications">Notificaciones:</label>
        <input
          id="notifications"
          type="checkbox"
          checked={notifications}
          onChange={handleNotificationsChange}
        />
      </div>
    </div>
  );
};

export default UserSettings;
