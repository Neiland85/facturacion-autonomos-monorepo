# Usa una imagen base de Node.js
FROM node:20

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copia los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# Instala las dependencias
RUN pnpm install

# Copia el resto de los archivos del proyecto
COPY . .

# Expone el puerto en el que corre el servicio
EXPOSE 3000

# Comando para iniciar el servicio
CMD ["yarn", "start"]