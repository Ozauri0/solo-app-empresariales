const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createNotification, 
    getNotificationsByCourse, 
    getUserNotifications, 
    markNotificationAsRead,
    deleteNotification,
    updateNotification
} = require('../controllers/notificationController');

// Rutas para las notificaciones
router.post('/', protect, authorize('admin', 'instructor', 'teacher'), createNotification);
router.get('/course/:courseId', protect, getNotificationsByCourse);
router.get('/user', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationAsRead);

// Nuevas rutas para eliminar y editar notificaciones
router.delete('/:id', protect, authorize('admin', 'instructor', 'teacher'), deleteNotification);
router.put('/:id', protect, authorize('admin', 'instructor', 'teacher'), updateNotification);

module.exports = router;