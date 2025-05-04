const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Grade = require('../models/Grade');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');

// Obtener todas las calificaciones (filtradas según el rol)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    const { courseId, studentId } = req.query;
    
    // Filtrar por curso si se proporciona
    if (courseId) {
      query.course = courseId;
    }
    
    // Si es estudiante, mostrar solo sus calificaciones
    if (req.user.role === 'student') {
      query.student = req.user.id;
    } 
    // Si es profesor, mostrar solo las calificaciones de sus cursos
    else if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      query.course = { $in: courseIds };
      
      // Filtrar por estudiante si se proporciona
      if (studentId) {
        query.student = studentId;
      }
    } 
    // Si es admin y proporciona studentId, filtrar por estudiante
    else if (req.user.role === 'admin' && studentId) {
      query.student = studentId;
    }
    
    const grades = await Grade.find(query)
      .populate('student', 'name username email')
      .populate('course', 'title code')
      .populate('assignment', 'title')
      .populate('gradedBy', 'name username')
      .sort({ gradedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las calificaciones',
      error: error.message
    });
  }
});

// Obtener calificaciones de un curso específico
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const { courseId } = req.params;
    let query = { course: courseId };
    
    // Verificar si el curso existe
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificar permisos
    const isInstructor = course.instructor.toString() === req.user.id;
    const isStudent = course.students.includes(req.user.id);
    
    if (req.user.role === 'student' && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estas calificaciones'
      });
    }
    
    if (req.user.role === 'teacher' && !isInstructor) {
      return res.status(403).json({
        success: false,
        message: 'No eres el instructor de este curso'
      });
    }
    
    // Si es estudiante, filtrar solo sus calificaciones
    if (req.user.role === 'student') {
      query.student = req.user.id;
    }
    
    const grades = await Grade.find(query)
      .populate('student', 'name username email')
      .populate('assignment', 'title')
      .populate('gradedBy', 'name username')
      .sort({ gradedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las calificaciones del curso',
      error: error.message
    });
  }
});

// Obtener calificaciones de un estudiante específico
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Verificar permisos
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Solo puedes ver tus propias calificaciones'
      });
    }
    
    let query = { student: studentId };
    
    // Si es profesor, filtrar solo por cursos que enseña
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }
    
    const grades = await Grade.find(query)
      .populate('course', 'title code')
      .populate('assignment', 'title')
      .populate('gradedBy', 'name username')
      .sort({ gradedAt: -1 });
    
    res.status(200).json({
      success: true,
      count: grades.length,
      grades
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las calificaciones del estudiante',
      error: error.message
    });
  }
});

// Crear una nueva calificación
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { 
      student, 
      course, 
      assignment, 
      grade, 
      maxGrade, 
      feedback 
    } = req.body;
    
    // Verificar si el curso existe
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    if (req.user.role !== 'admin' && courseExists.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para calificar en este curso'
      });
    }
    
    // Verificar si el estudiante está inscrito en el curso
    const isEnrolled = courseExists.students.includes(student);
    if (!isEnrolled) {
      return res.status(400).json({
        success: false,
        message: 'El estudiante no está inscrito en este curso'
      });
    }
    
    // Crear la calificación
    const newGrade = new Grade({
      student,
      course,
      assignment,
      grade,
      maxGrade,
      feedback,
      gradedBy: req.user.id
    });
    
    await newGrade.save();
    
    // Si la calificación está asociada a una tarea, actualizar también la entrega
    if (assignment) {
      const assignmentDoc = await Assignment.findById(assignment);
      if (assignmentDoc) {
        const submission = assignmentDoc.submissions.find(
          sub => sub.student.toString() === student
        );
        
        if (submission) {
          submission.grade = grade;
          submission.feedback = feedback;
          await assignmentDoc.save();
        }
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'Calificación creada exitosamente',
      grade: newGrade
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la calificación',
      error: error.message
    });
  }
});

// Actualizar una calificación
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { grade, maxGrade, feedback } = req.body;
    
    // Verificar si la calificación existe
    let gradeDoc = await Grade.findById(req.params.id);
    if (!gradeDoc) {
      return res.status(404).json({
        success: false,
        message: 'Calificación no encontrada'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    const course = await Course.findById(gradeDoc.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar esta calificación'
      });
    }
    
    // Actualizar la calificación
    gradeDoc = await Grade.findByIdAndUpdate(
      req.params.id,
      {
        grade,
        maxGrade,
        feedback,
        gradedBy: req.user.id,
        gradedAt: Date.now()
      },
      { new: true, runValidators: true }
    );
    
    // Si la calificación está asociada a una tarea, actualizar también la entrega
    if (gradeDoc.assignment) {
      const assignment = await Assignment.findById(gradeDoc.assignment);
      if (assignment) {
        const submission = assignment.submissions.find(
          sub => sub.student.toString() === gradeDoc.student.toString()
        );
        
        if (submission) {
          submission.grade = grade;
          submission.feedback = feedback;
          await assignment.save();
        }
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Calificación actualizada exitosamente',
      grade: gradeDoc
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la calificación',
      error: error.message
    });
  }
});

// Eliminar una calificación
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    // Verificar si la calificación existe
    const gradeDoc = await Grade.findById(req.params.id);
    if (!gradeDoc) {
      return res.status(404).json({
        success: false,
        message: 'Calificación no encontrada'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    const course = await Course.findById(gradeDoc.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta calificación'
      });
    }
    
    await gradeDoc.remove();
    
    res.status(200).json({
      success: true,
      message: 'Calificación eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la calificación',
      error: error.message
    });
  }
});

module.exports = router;