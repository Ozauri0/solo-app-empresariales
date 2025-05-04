const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs'); // Importar fs para manejo de archivos
const fileUpload = require('express-fileupload'); // Añadir express-fileupload

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000', // Origen local estándar de Next.js
  'http://localhost:3005', // Puerto configurado para producción
  'http://192.168.1.167:3000',
  'http://192.168.1.167:3005', 
  'http://192.168.1.167:5000',
  'http://192.168.1.167:5005', // Nuevo puerto de API
  'https://lp.christianferrer.me',
  // Permitir solicitudes internas en Docker
  'http://frontend:3005',
  'http://api:5005'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o apps móviles) o si el origen está en la lista
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Si necesitas enviar cookies o encabezados de autorización
};

// Middleware
app.use(cors(corsOptions)); // Usar la configuración de CORS definida

// Aumentar límites para JSON y datos codificados en URL para formularios grandes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configurar middleware para carga de archivos (express-fileupload)
// Solo usar para rutas específicas que no usen multer
const fileUploadMiddleware = fileUpload({
  limits: { 
    fileSize: 50 * 1024 * 1024 // Aumentar a 50MB para archivos grandes
  },
  createParentPath: true,      // Crear directorio si no existe
  useTempFiles: true,          // Usar archivos temporales para reducir uso de memoria
  tempFileDir: '/tmp/',        // Directorio para archivos temporales
  abortOnLimit: false,         // No abortar automáticamente para manejar error correctamente
  debug: process.env.NODE_ENV !== 'production' // Habilitar depuración fuera de producción
});

// Solo aplicar express-fileupload a rutas específicas que lo necesiten
app.use('/api/upload', fileUploadMiddleware);
app.use('/api/news', fileUploadMiddleware);

// Configuración mejorada de archivos estáticos
// Configuración principal para la ruta /uploads
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads'), {
  maxAge: '1d', // Caché por 1 día
  etag: true
}));

// Configuración específica para materiales de curso
app.use('/uploads/course-materials', express.static(path.join(__dirname, '..', 'public', 'uploads', 'course-materials'), {
  maxAge: '1d',
  etag: true
}));

// Configuración específica para imágenes de cursos
app.use('/uploads/courses', express.static(path.join(__dirname, '..', 'public', 'uploads', 'courses'), {
  maxAge: '1d',
  etag: true
}));

// Ruta adicional para debugging y diagnóstico
app.get('/check-file/:folder/:filename', (req, res) => {
  const { folder, filename } = req.params;
  const filePath = path.join(__dirname, '..', 'public', 'uploads', folder, filename);
  
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(`Archivo no encontrado: ${filePath}`);
      return res.status(404).json({
        success: false,
        message: 'Archivo no encontrado',
        requestedPath: filePath,
        error: err.message
      });
    }
    
    console.log(`Archivo encontrado: ${filePath}`);
    return res.json({
      success: true,
      message: 'Archivo encontrado',
      filePath: filePath
    });
  });
});

// Importar rutas
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const courseMaterialRoutes = require('./routes/courseMaterialRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const newsRoutes = require('./routes/newsRoutes');
const uploadRoutes = require('./routes/uploadRoutes'); // Importar rutas de upload

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', courseMaterialRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes); // Añadir rutas de upload

// Manejar errores de multer y otros middleware de subida
app.use((err, req, res, next) => {
  console.error('Error en middleware:', err);
  
  if (err && err.message === 'Tipo de archivo no permitido') {
    res.status(400).json({
      success: false,
      message: 'El tipo de archivo seleccionado no está permitido'
    });
  } else if (err && err.code === 'LIMIT_FILE_SIZE') {
    res.status(400).json({
      success: false,
      message: 'El archivo excede el tamaño máximo permitido'
    });
  } else if (err && err.message && err.message.includes('Unexpected end of form')) {
    res.status(400).json({
      success: false,
      message: 'La carga del archivo se interrumpió. Esto puede deberse a una conexión inestable o a un archivo demasiado grande.',
      error: err.message
    });
  } else if (err) {
    res.status(500).json({
      success: false,
      message: 'Error en el servidor al procesar el archivo',
      error: err.message
    });
  } else {
    next();
  }
});

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de Solo-App-Empresariales' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conexión a MongoDB establecida');
    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });