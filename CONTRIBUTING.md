# Guía de Contribución

¡Gracias por tu interés en contribuir a este proyecto! Para mantener un flujo de trabajo organizado y eficiente, sigue estas pautas al contribuir.

## 🛠️ Configuración del Entorno Local

1. Clona el repositorio:

   ```bash
   git clone git@github.com:Neiland85/facturacion-autonomos-monorepo.git
   ```

2. Instala las dependencias:

   ```bash
   cd facturacion-autonomos-monorepo
   npm install
   ```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en los directorios `backend` y `frontend` basándote en los archivos `.env.example`.

## 🚀 Flujo de Trabajo

1. Crea una rama para tu contribución:

   ```bash
   git checkout -b feature/nombre-de-la-funcionalidad
   ```

2. Realiza tus cambios y asegúrate de que las pruebas pasen:

   ```bash
   npm test
   ```

3. Realiza un commit descriptivo:

   ```bash
   git commit -m "Añadida nueva funcionalidad X"
   ```

4. Sube tu rama al repositorio remoto:

   ```bash
   git push origin feature/nombre-de-la-funcionalidad
   ```

5. Abre un Pull Request en GitHub y describe tus cambios.

## 📋 Reglas de Código

- Sigue las reglas de ESLint y Prettier.
- Asegúrate de que el código esté bien documentado.
- Escribe pruebas unitarias para cualquier nueva funcionalidad.

## 🧪 Pruebas

- Ejecuta las pruebas unitarias antes de enviar tu contribución:

  ```bash
  npm test
  ```

- Genera un informe de cobertura:

  ```bash
  npm test -- --coverage
  ```

---

¡Gracias por contribuir!
