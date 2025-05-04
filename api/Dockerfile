FROM node:20-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el código fuente
COPY . .

# Crear directorios necesarios para uploads si no existen
RUN mkdir -p ./public/uploads/news
RUN mkdir -p ./public/uploads/courses
RUN mkdir -p ./public/uploads/course-materials

# Puerto en el que se ejecutará la aplicación
ENV PORT=5005
ENV NODE_ENV=production

# Exponer el puerto
EXPOSE 5005

# Comando para iniciar la aplicación
CMD ["node", "server.js"]