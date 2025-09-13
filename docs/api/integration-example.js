// Ejemplo de integración en un servicio Express
const express = require('express');
const { setupSwagger } = require('./config/serviceName-swagger');

const app = express();

// ... otras configuraciones del servicio ...

// Configurar documentación API
setupSwagger(app);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 serviceName ejecutándose en puerto ${PORT}`);
  console.log(`📖 Documentación: http://localhost:${PORT}/api-docs`);
});
