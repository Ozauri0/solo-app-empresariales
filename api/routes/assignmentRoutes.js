const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Obtener todas las tareas
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    const { courseId } = req.query;
    
    // Filtrar por curso si se proporciona un ID de curso
    if (courseId) {
      query.course = courseId;
    }
    
    // Si es estudiante, mostrar solo las tareas de sus cursos
    if (req.user.role === 'student') {
      const enrolledCourses = await Course.find({ students: req.user.id }).select('_id');
      const courseIds = enrolledCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }
    
    // Si es profesor, mostrar solo las tareas de sus cursos
    if (req.user.role === 'teacher') {
      const teacherCourses = await Course.find({ instructor: req.user.id }).select('_id');
      const courseIds = teacherCourses.map(course => course._id);
      query.course = { $in: courseIds };
    }
    
    const assignments = await Assignment.find(query)
      .populate('course', 'title code')
      .sort({ dueDate: 1 });
    
    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tareas',
      error: error.message
    });
  }
});

// Obtener una tarea por ID
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title code instructor students')
      .populate('submissions.student', 'name username email');
    
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si el usuario tiene acceso a esta tarea
    const course = await Course.findById(assignment.course._id);
    const isInstructor = course.instructor.toString() === req.user.id;
    const isStudent = course.students.some(student => student.toString() === req.user.id);
    
    if (req.user.role !== 'admin' && !isInstructor && !isStudent) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver esta tarea'
      });
    }
    
    res.status(200).json({
      success: true,
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la tarea',
      error: error.message
    });
  }
});

// Crear una nueva tarea
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      course, 
      dueDate, 
      points, 
      attachments 
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
        message: 'No tienes permiso para crear tareas en este curso'
      });
    }
    
    const assignment = new Assignment({
      title,
      description,
      course,
      dueDate,
      points,
      attachments: attachments || []
    });
    
    await assignment.save();
    
    res.status(201).json({
      success: true,
      message: 'Tarea creada exitosamente',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al crear la tarea',
      error: error.message
    });
  }
});

// Actualizar una tarea
router.put('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { 
      title, 
      description, 
      dueDate, 
      points, 
      attachments 
    } = req.body;
    
    // Verificar si la tarea existe
    let assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para modificar esta tarea'
      });
    }
    
    assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        dueDate,
        points,
        attachments
      },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Tarea actualizada exitosamente',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la tarea',
      error: error.message
    });
  }
});

// Eliminar una tarea
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    // Verificar si la tarea existe
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta tarea'
      });
    }
    
    await assignment.remove();
    
    res.status(200).json({
      success: true,
      message: 'Tarea eliminada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la tarea',
      error: error.message
    });
  }
});

// Enviar una tarea (para estudiantes)
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const { attachments } = req.body;
    
    // Verificar si la tarea existe
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si el estudiante está inscrito en el curso
    const course = await Course.findById(assignment.course);
    const isEnrolled = course.students.some(student => student.toString() === req.user.id);
    
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'No estás inscrito en este curso'
      });
    }
    
    // Verificar si la tarea ya ha vencido
    if (new Date(assignment.dueDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'La fecha límite para esta tarea ya ha pasado'
      });
    }
    
    // Verificar si el estudiante ya ha enviado la tarea y actualizar o crear nueva entrega
    const submissionIndex = assignment.submissions.findIndex(
      submission => submission.student.toString() === req.user.id
    );
    
    if (submissionIndex > -1) {
      // Actualizar la entrega existente
      assignment.submissions[submissionIndex].submittedAt = Date.now();
      assignment.submissions[submissionIndex].attachments = attachments || [];
    } else {
      // Crear nueva entrega
      assignment.submissions.push({
        student: req.user.id,
        submittedAt: Date.now(),
        attachments: attachments || []
      });
    }
    
    await assignment.save();
    
    res.status(200).json({
      success: true,
      message: 'Tarea enviada exitosamente',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar la tarea',
      error: error.message
    });
  }
});

// Calificar una tarea (para profesores)
router.post('/:id/grade/:submissionId', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { grade, feedback } = req.body;
    
    // Verificar si la tarea existe
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Tarea no encontrada'
      });
    }
    
    // Verificar si el usuario es el instructor del curso o admin
    const course = await Course.findById(assignment.course);
    if (req.user.role !== 'admin' && course.instructor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para calificar esta tarea'
      });
    }
    
    // Encontrar la entrega del estudiante
    const submission = assignment.submissions.id(req.params.submissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Entrega no encontrada'
      });
    }
    
    // Actualizar calificación y retroalimentación
    submission.grade = grade;
    submission.feedback = feedback;
    
    await assignment.save();
    
    res.status(200).json({
      success: true,
      message: 'Tarea calificada exitosamente',
      assignment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al calificar la tarea',
      error: error.message
    });
  }
});

module.exports = router;