const express = require('express');
const router = express.Router();
const { 
  getAllCourses, 
  getCourseById, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  enrollStudent, 
  removeStudent 
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Rutas para profesores y administradores
router.post('/', protect, authorize('teacher', 'admin'), createCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, authorize('teacher', 'admin'), enrollStudent);
router.delete('/:id/students', protect, authorize('teacher', 'admin'), removeStudent);

module.exports = router;