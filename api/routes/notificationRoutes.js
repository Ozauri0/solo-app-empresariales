const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { 
    createNotification, 
    getNotificationsByCourse, 
    getUserNotifications, 
    markNotificationAsRead 
} = require('../controllers/notificationController');

// Rutas para las notificaciones
router.post('/', protect, authorize('admin', 'instructor'), createNotification);
router.get('/course/:courseId', protect, getNotificationsByCourse);
router.get('/user', protect, getUserNotifications);
router.put('/:id/read', protect, markNotificationAsRead);

module.exports = router;