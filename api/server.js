const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuración de CORS
const allowedOrigins = [
  'http://localhost:3000', // Origen local estándar de Next.js
  'http://192.168.1.167:3000', // IP local para acceso desde otros dispositivos (asumiendo que Next.js corre en el puerto 3000)
  'http://192.168.1.167:5000', // Permitir solicitudes desde la propia API si es necesario
  'https://lp.christianferrer.me' // URL de producción
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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurar archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

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

// Manejar errores de multer
app.use((err, req, res, next) => {
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
  } else if (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error en el servidor'
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