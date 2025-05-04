const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  changePassword,
  closeSession,
  closeAllSessions,
  getUserByEmail
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/session/close', protect, closeSession);
router.post('/session/close-all', protect, closeAllSessions);

// Ruta para buscar usuario por email (permitida para profesores y admins)
router.get('/search', protect, authorize('admin', 'teacher'), (req, res) => {
  if (!req.query.email) {
    return res.status(400).json({
      success: false,
      message: 'Se requiere un correo electrónico para la búsqueda'
    });
  }
  getUserByEmail(req, res);
});

// Rutas de administrador
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);
// Añadir ruta POST para crear usuarios desde el panel de administración
router.post('/', protect, authorize('admin'), register);

module.exports = router;