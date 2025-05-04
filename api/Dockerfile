FROM node:20-alpine

WORKDIR /app

# Instalar herramientas necesarias para debugging
RUN apk add --no-cache bash curl

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (cambiando npm ci por npm install)
RUN npm install --omit=dev

# Copiar el código fuente
COPY . .

# Crear directorios necesarios para uploads con permisos adecuados
RUN mkdir -p ./public/uploads/news && \
    mkdir -p ./public/uploads/courses && \
    mkdir -p ./public/uploads/course-materials && \
    chmod -R 777 ./public/uploads

# Crear directorio temporal con permisos adecuados
RUN mkdir -p /tmp/course-materials && \
    chmod -R 777 /tmp

# Configurar variables de entorno
ENV PORT=5005
ENV NODE_ENV=production
# Aumentar el límite de tamaño de payload para Node.js
ENV NODE_OPTIONS=--max-http-header-size=16384

# Exponer el puerto
EXPOSE 5005

# Comando para iniciar la aplicación con más memoria disponible
CMD ["node", "--max-old-space-size=2048", "server.js"]