# LearnPro - Sistema Online de Logística y Organización

Este es un sistema de gestión académica/empresarial desarrollado con [Next.js](https://nextjs.org) que permite a los usuarios gestionar cursos, tareas, mensajes, calendarios y más en un entorno intuitivo y moderno.

## Características principales

- **Dashboard**: Visualización general con cursos, anuncios y calendario
- **Gestión de cursos**: Listado y acceso a los cursos disponibles
- **Sistema de tareas**: Seguimiento de tareas pendientes y completadas
- **Mensajería**: Sistema de comunicación entre usuarios
- **Calendario**: Organización de eventos y fechas importantes
- **Calificaciones**: Consulta de calificaciones por curso
- **Sistema de notificaciones**: Alertas y comunicaciones específicas por curso
- **Panel administrativo**: Gestión centralizada de usuarios, noticias y cursos

## Funcionalidades operativas

### Sistema de autenticación
- **Registro de usuarios**: Creación de cuentas con diferentes roles (estudiante, profesor, administrador)
- **Inicio de sesión**: Autenticación mediante token JWT
- **Gestión de sesiones**: Control de sesiones activas
- **Recuperación y cambio de contraseña**: Desde el perfil de usuario

### Dashboard
- **Panel de noticias**: Visualización de anuncios destacados
- **Notificaciones de cursos**: Alertas de cursos en tiempo real
- **Vista personalizada**: Contenido adaptado según el rol del usuario

### Gestión de cursos
- **Listado de cursos**: Visualización de todos los cursos asociados al usuario
- **Detalles de curso**: Vista detallada con información completa
- **Materiales del curso**: Subida y descarga de archivos y recursos
- **Sistema de alertas**: Comunicaciones específicas para cada curso
- **Permisos basados en rol**: Funcionalidades específicas para instructores/profesores

### Sistema de notificaciones
- **Alertas por curso**: Avisos específicos por asignatura
- **Estado de lectura**: Control de notificaciones leídas/no leídas
- **Gestión de notificaciones**: Edición y eliminación por parte de instructores

### Perfil de usuario
- **Datos personales**: Visualización y edición de información
- **Cambio de contraseña**: Actualización segura de credenciales
- **Gestión de sesiones activas**: Control de accesos al sistema

### Panel administrativo
- **Gestión de usuarios**: Creación, edición y eliminación de cuentas
- **Gestión de noticias**: Publicación y control de anuncios institucionales
- **Control de cursos**: Administración centralizada de asignaturas

## Guía de uso

> **IMPORTANTE**: Para acceder al sistema debes utilizar las credenciales proporcionadas por el administrador. Los diferentes tipos de usuario (estudiante, profesor, administrador) tienen distintos niveles de acceso y funcionalidades disponibles.

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
    notifications/ # Notificaciones del sistema
    admin/         # Panel de administración
components/        # Componentes reutilizables
  ui/              # Componentes de interfaz
api/
  controllers/     # Controladores para la lógica de negocio
  models/          # Definiciones de modelos de datos
  routes/          # Rutas API REST
```

## Tecnologías utilizadas

- **Next.js**: Framework de React para desarrollo web
- **MongoDB**: Base de datos para almacenamiento de información
- **Express**: Backend API para gestión de datos
- **JWT**: Sistema de autenticación basado en tokens
- **Tailwind CSS**: Framework de utilidades CSS para la interfaz
- **Docker**: Contenedorización para despliegue

## Últimas actualizaciones (Mayo 2025)

- **Sistema de notificaciones**: Implementación completa con gestión de lectura y permisos
- **Panel de administración mejorado**: Nuevas funcionalidades para gestión de usuarios y noticias
- **Optimización de carga de archivos**: Mejora en el sistema de materiales de curso
- **Seguridad reforzada**: Actualizaciones en el sistema de autenticación y gestión de sesiones
- **Interfaz responsive**: Adaptación completa para dispositivos móviles y tablets

## Información para desarrolladores

Para aprender más sobre Next.js, consulta los siguientes recursos:

- [Documentación de Next.js](https://nextjs.org/docs) - Aprende sobre las características y API de Next.js.
- [Aprende Next.js](https://nextjs.org/learn) - Un tutorial interactivo de Next.js.

Puedes revisar [el repositorio de GitHub de Next.js](https://github.com/vercel/next.js) - ¡Tus comentarios y contribuciones son bienvenidos!

## Despliegue con Docker

Esta aplicación está configurada para ser desplegada fácilmente utilizando Docker, lo que permite una implementación consistente en cualquier entorno:

### Requisitos previos
- Docker y Docker Compose instalados en el servidor
- MongoDB configurado (incluido en docker-compose.yml)

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
