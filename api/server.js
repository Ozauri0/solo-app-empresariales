const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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

// Usar rutas
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api', courseMaterialRoutes);

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