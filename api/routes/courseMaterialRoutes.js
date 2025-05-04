const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { 
  getCourseMaterials, 
  getCourseMaterial, 
  createCourseMaterial, 
  updateCourseMaterial,
  deleteCourseMaterial 
} = require('../controllers/courseMaterialController');

// Configurar almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'course-materials');
      console.log('Directorio de materiales:', uploadDir);
      
      // Crear directorio si no existe con permisos adecuados
      if (!fs.existsSync(uploadDir)) {
        console.log('Creando directorio de materiales...');
        fs.mkdirSync(uploadDir, { recursive: true, mode: 0o775 });
        console.log('Directorio creado correctamente');
      }
      
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al crear directorio para materiales:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Generar nombre único para el archivo
      const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
      console.log('Nombre de archivo generado:', uniqueName);
      cb(null, uniqueName);
    } catch (error) {
      console.error('Error al generar nombre de archivo:', error);
      cb(error);
    }
  }
});

// Filtro para tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  // Permitir solo ciertos tipos de archivo (ajustar según necesidades)
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/zip',
    'application/x-rar-compressed'
  ];
  
  console.log('Tipo MIME del archivo:', file.mimetype);
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('Tipo de archivo no permitido:', file.mimetype);
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

// Middleware para manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Error de Multer:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo excede el tamaño máximo permitido (25MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Error en la subida: ${err.message}`
    });
  } else if (err) {
    console.error('Error en middleware de subida:', err);
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Rutas para materiales de un curso
router.get('/courses/:courseId/materials', protect, getCourseMaterials);
router.get('/courses/:courseId/materials/:materialId', protect, getCourseMaterial);
router.post('/courses/:courseId/materials', protect, authorize('teacher', 'admin'), upload.single('file'), handleMulterError, createCourseMaterial);
router.put('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), upload.single('file'), handleMulterError, updateCourseMaterial);
router.delete('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), deleteCourseMaterial);

module.exports = router;