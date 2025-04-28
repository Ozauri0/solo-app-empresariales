const Notification = require('../models/Notification');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Crear una nueva notificación/alerta
// @route   POST /api/notifications
// @access  Private (Admin, Instructor)
const createNotification = asyncHandler(async (req, res) => {
  const { courseId, title, message, isAlert } = req.body;

  // Verificar que el curso existe
  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error('Curso no encontrado');
  }

  // Obtener el ID del usuario
  const userId = req.user._id || req.user.id;

  // Verificar que el usuario es instructor del curso o admin
  const isInstructor = course.instructor && 
                       course.instructor.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isInstructor && !isAdmin) {
    res.status(403);
    throw new Error('No tienes permisos para enviar notificaciones en este curso');
  }

  // Crear la notificación
  const notification = await Notification.create({
    courseId,
    sender: userId,
    title,
    message,
    isAlert: isAlert !== undefined ? isAlert : true
  });

  res.status(201).json(notification);
});

// @desc    Obtener notificaciones por curso
// @route   GET /api/notifications/course/:courseId
// @access  Private
const getNotificationsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  
  console.log(`\n[DEBUG] Solicitud de notificaciones para curso: ${courseId}`);
  
  // Verificar que el curso existe
  const course = await Course.findById(courseId);
  if (!course) {
    console.log(`[ERROR] Curso no encontrado: ${courseId}`);
    res.status(404);
    throw new Error('Curso no encontrado');
  }

  // Obtener el ID del usuario
  const userId = req.user._id || req.user.id;
  
  console.log(`[DEBUG] Usuario (ID: ${userId}, Rol: ${req.user.role}) solicitando acceso al curso ${courseId}`);

  // Verificamos directamente en la base de datos si el usuario es instructor
  let isInstructor = false;
  if (req.user.role === 'instructor' || req.user.role === 'teacher') {
    console.log(`[DEBUG] Verificando si es instructor...`);
    
    // Verificación directa con la base de datos
    const instructorCheck = await Course.findOne({
      _id: courseId,
      instructor: userId
    });
    
    isInstructor = !!instructorCheck;
    console.log(`[DEBUG] ¿Es instructor?: ${isInstructor}`);
  }

  const isAdmin = req.user.role === 'admin';
  console.log(`[DEBUG] ¿Es admin?: ${isAdmin}`);
  
  // Verificación directa para estudiantes
  let isEnrolled = false;
  if (!isInstructor && !isAdmin) {
    console.log(`[DEBUG] Verificando si es estudiante...`);
    const studentCheck = await Course.findOne({
      _id: courseId,
      students: userId
    });
    
    isEnrolled = !!studentCheck;
    console.log(`[DEBUG] ¿Está matriculado?: ${isEnrolled}`);
  }
  
  // Permitir acceso si es instructor, admin o está matriculado
  if (isInstructor || isAdmin || isEnrolled) {
    console.log(`[DEBUG] Acceso permitido para usuario ${userId} al curso ${courseId}`);
    
    try {
      // Obtener las notificaciones
      const notifications = await Notification.find({ courseId })
        .sort({ createdAt: -1 })
        .populate('sender', 'name');

      console.log(`[DEBUG] Notificaciones encontradas: ${notifications.length}`);

      // Marcar cuáles han sido leídas por el usuario actual
      const notificationsWithReadStatus = notifications.map(notification => {
        const notifObj = notification.toObject();
        
        // Verificar si el usuario ha leído esta notificación
        const isRead = notification.readBy && notification.readBy.some(read => 
          read.user && read.user.toString() === userId.toString()
        );
        
        return { ...notifObj, isRead };
      });

      console.log(`[DEBUG] Enviando respuesta con ${notificationsWithReadStatus.length} notificaciones`);
      return res.json(notificationsWithReadStatus);
    } catch (error) {
      console.error('[ERROR] Error al procesar notificaciones:', error);
      res.status(500);
      throw new Error(`Error al procesar notificaciones: ${error.message}`);
    }
  } else {
    console.log(`[ERROR] Acceso denegado para usuario ${userId} al curso ${courseId}`);
    res.status(403);
    throw new Error('No tienes permisos para ver las notificaciones de este curso');
  }
});

// @desc    Obtener todas las notificaciones del usuario
// @route   GET /api/notifications/user
// @access  Private
const getUserNotifications = asyncHandler(async (req, res) => {
  // Obtener el ID del usuario
  const userId = req.user._id || req.user.id;
  
  // Obtener los cursos donde está matriculado el usuario o es instructor
  const enrolledCourses = await Course.find({
    $or: [
      { students: userId },
      { instructor: userId }
    ]
  });

  const courseIds = enrolledCourses.map(course => course._id);

  // Obtener notificaciones de esos cursos
  const notifications = await Notification.find({
    courseId: { $in: courseIds }
  })
    .sort({ createdAt: -1 })
    .populate('sender', 'name')
    .populate('courseId', 'name');

  // Marcar cuáles han sido leídas por el usuario actual
  const notificationsWithReadStatus = notifications.map(notification => {
    const notifObj = notification.toObject();
    const isRead = notification.readBy.some(read => 
      read.user && read.user.toString() === userId.toString()
    );
    return { ...notifObj, isRead };
  });

  res.json(notificationsWithReadStatus);
});

// @desc    Marcar una notificación como leída
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    res.status(404);
    throw new Error('Notificación no encontrada');
  }

  // Obtener el ID del usuario
  const userId = req.user._id || req.user.id;

  // Verificar si ya está marcada como leída
  const alreadyRead = notification.readBy.some(read => 
    read.user && read.user.toString() === userId.toString()
  );
  
  if (!alreadyRead) {
    notification.readBy.push({ user: userId });
    await notification.save();
  }

  res.json({ success: true });
});

module.exports = {
  createNotification,
  getNotificationsByCourse,
  getUserNotifications,
  markNotificationAsRead
};