# LearnPro - Sistema Online de Logística y Organización

Este es un sistema de gestión académica/empresarial desarrollado con [Next.js](https://nextjs.org) que permite a los usuarios gestionar cursos, tareas, mensajes, calendarios y más en un entorno intuitivo y moderno.

## Características principales

- **Dashboard**: Visualización general con cursos, anuncios y calendario
- **Gestión de cursos**: Listado y acceso a los cursos disponibles
- **Sistema de tareas**: Seguimiento de tareas pendientes y completadas
- **Mensajería**: Sistema de comunicación entre usuarios
- **Calendario**: Organización de eventos y fechas importantes
- **Calificaciones**: Consulta de calificaciones por curso

## Guía de uso

> **IMPORTANTE**: Actualmente, la aplicación no requiere un proceso de autenticación real. Para acceder al sistema, simplemente haz clic en el botón de "Iniciar sesión" en la página principal. No es necesario ingresar credenciales.

## Ejecutar la aplicación

### Entorno de desarrollo

Para ejecutar la aplicación en modo desarrollo:

```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

### Producción con Docker

La aplicación está configurada para ser ejecutada en Docker:

1. Construir la imagen:
   ```bash
   docker-compose build
   ```

2. Iniciar la aplicación:
   ```bash
   docker-compose up -d
   ```

3. La aplicación estará disponible en [http://localhost:3005](http://localhost:3005)

## Estructura del proyecto

```
src/
  app/             # Páginas de la aplicación
    dashboard/     # Página principal con resumen
    assignments/   # Tareas y actividades
    courses/       # Listado de cursos
    messages/      # Sistema de mensajería
    grades/        # Calificaciones
    calendar/      # Calendario de eventos
    profile/       # Perfil del usuario
components/        # Componentes reutilizables
  ui/              # Componentes de interfaz
```

## Tecnologías utilizadas

- **Next.js**: Framework de React para desarrollo web
- **Tailwind CSS**: Framework de utilidades CSS
- **Docker**: Contenedorización para despliegue

## Información para desarrolladores

Para aprender más sobre Next.js, consulta los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - Aprende sobre las características y API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn) - Un tutorial interactivo de Next.js.

Puedes revisar [el repositorio de GitHub de Next.js](https://github.com/vercel/next.js) - ¡Tus comentarios y contribuciones son bienvenidos!

## Despliegue con Docker

Esta aplicación está configurada para ser desplegada fácilmente utilizando Docker, lo que permite una implementación consistente en cualquier entorno:

### Requisitos previos
- Docker y Docker Compose instalados en el servidor

### Pasos para el despliegue

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/Ozauri0 solo-app-empresariales
   cd solo-app-empresariales
   ```

2. **Construir la imagen de Docker**:
   ```bash
   docker-compose build
   ```

3. **Iniciar los contenedores**:
   ```bash
   docker-compose up -d
   ```

4. **Verificar que los contenedores estén funcionando**:
   ```bash
   docker-compose ps
   ```

5. **Acceder a la aplicación**:
   La aplicación estará disponible en [http://localhost:3005](http://localhost:3005)

### Configuración adicional

- Para cambiar el puerto, modifica el valor en `docker-compose.yml` y en el archivo `next.config.ts`
- Los logs se pueden consultar con `docker-compose logs -f`

### Actualización de la aplicación

Para actualizar la aplicación con nuevos cambios:

```bash
git pull
docker-compose down
docker-compose build
docker-compose up -d
```
