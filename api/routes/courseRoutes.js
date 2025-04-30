const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp'); // Importar sharp para el procesamiento de imágenes
const Course = require('../models/Course'); // Añadiendo importación del modelo Course
const { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  enrollStudent, 
  removeStudent,
  updateCourseImage
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../../public/uploads/courses'));
  },
  filename: function(req, file, cb) {
    cb(null, `course-${req.params.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

// Rutas protegidas
router.get('/', protect, getAllCourses);
router.get('/:id', protect, getCourseById);

// Rutas para profesores y administradores
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('teacher', 'admin'), enrollStudent);
router.delete('/:id/students', protect, authorize('teacher', 'admin'), removeStudent);

// Rutas para actualizar y eliminar la imagen del curso
router.post('/:id/image', protect, authorize('teacher', 'admin'), upload.single('image'), async (req, res) => {
  try {
    // Verificar si hay un archivo en la solicitud
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ninguna imagen'
      });
    }

    // Buscar el curso por ID
    let course = await Course.findById(req.params.id);
    
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }

    // Verificar si el usuario es el instructor o un administrador
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para actualizar este curso'
      });
    }

    // Ruta de archivo original
    const filePath = req.file.path;
    
    // Generar el nombre para la imagen procesada
    const fileName = `course-${req.params.id}-${Date.now()}-optimized.webp`;
    const outputPath = path.join(__dirname, '../../public/uploads/courses', fileName);
    
    // Procesamiento de imagen: redimensionar a tamaño estándar (1280x360 para banner)
    await sharp(filePath)
      .resize(1280, 360, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    // Eliminar archivo original
    fs.unlinkSync(filePath);
    
    // Construir la ruta de la imagen para almacenar en la base de datos
    const imagePath = `/uploads/courses/${fileName}`;

    // Actualizar la imagen del curso
    course = await Course.findByIdAndUpdate(
      req.params.id,
      { $set: { image: imagePath } },
      { new: true, runValidators: true }
    ).populate('instructor', 'name email username');

    res.status(200).json({
      success: true,
      message: 'Imagen del curso actualizada exitosamente',
      course
    });
  } catch (error) {
    console.error('Error al actualizar la imagen del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la imagen del curso',
      error: error.message
    });
  }
});

// Ruta para eliminar la imagen del curso (establece la imagen predeterminada)
router.delete('/:id/image', protect, authorize('teacher', 'admin'), (req, res) => {
  try {
    Course.findByIdAndUpdate(
      req.params.id,
      { $set: { image: '/placeholder.svg?height=300&width=500' } },
      { new: true, runValidators: true }
    )
    .populate('instructor', 'name email username')
    .then(course => {
      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Curso no encontrado'
        });
      }
      
      res.status(200).json({
        success: true,
        message: 'Imagen del curso eliminada exitosamente',
        course
      });
    });
  } catch (error) {
    console.error('Error al eliminar la imagen del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la imagen del curso',
      error: error.message
    });
  }
});

module.exports = router;