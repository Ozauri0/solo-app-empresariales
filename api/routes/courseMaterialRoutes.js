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
    const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'course-materials');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
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
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

// Configuración de multer
const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25 MB max
});

// Rutas para materiales de un curso
router.get('/courses/:courseId/materials', protect, getCourseMaterials);
router.get('/courses/:courseId/materials/:materialId', protect, getCourseMaterial);
router.post('/courses/:courseId/materials', protect, authorize('teacher', 'admin'), upload.single('file'), createCourseMaterial);
router.put('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), upload.single('file'), updateCourseMaterial);
router.delete('/courses/:courseId/materials/:materialId', protect, authorize('teacher', 'admin'), deleteCourseMaterial);

module.exports = router;