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

// Asegurar que los directorios de subida existan
const ensureUploadDirExists = () => {
  try {
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'course-materials');
    console.log('Verificando directorio de materiales:', uploadDir);
    
    if (!fs.existsSync(uploadDir)) {
      console.log('Creando directorio de materiales...');
      fs.mkdirSync(uploadDir, { recursive: true, mode: 0o775 });
      console.log('Directorio creado correctamente');
    }
    return uploadDir;
  } catch (error) {
    console.error('Error al verificar/crear directorio para materiales:', error);
    // Intentar crear en un directorio temporal como fallback
    const tempDir = path.join('/tmp', 'course-materials');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    return tempDir;
  }
};

// Crear los directorios necesarios al iniciar la aplicación
const uploadDir = ensureUploadDirExists();

// Configurar almacenamiento de archivos con multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error al establecer destino de archivo:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Generar nombre único para el archivo
      const uniqueName = `${Date.now()}-${uuidv4()}${path.extname(file.originalname)}`;
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
  
  // Permitir archivos sin tipo MIME en producción para mayor flexibilidad
  if (!file.mimetype && process.env.NODE_ENV === 'production') {
    console.warn('Archivo sin tipo MIME detectado, permitiendo en producción');
    cb(null, true);
    return;
  }
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('Tipo de archivo no permitido:', file.mimetype);
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// Configuración de multer con manejo de errores mejorado
const upload = multer({ 
  storage,
  fileFilter,
  limits: { 
    fileSize: 50 * 1024 * 1024, // 50 MB max
    fieldSize: 50 * 1024 * 1024 // Aumentar fieldSize también
  }
}).single('file');

// Middleware para manejo de errores de multer
const handleMulterError = (req, res, next) => {
  upload(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      console.error('Error de Multer:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'El archivo excede el tamaño máximo permitido (50MB)'
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
  });
};

// Rutas para materiales de un curso con manejo mejorado de errores
router.get('/courses/:courseId/materials', protect, getCourseMaterials);
router.get('/courses/:courseId/materials/:materialId', protect, getCourseMaterial);
router.post('/courses/:courseId/materials', protect, authorize('teacher', 'admin'), handleMulterError, createCourseMaterial);
router.put('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), handleMulterError, updateCourseMaterial);
router.delete('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), deleteCourseMaterial);

module.exports = router;