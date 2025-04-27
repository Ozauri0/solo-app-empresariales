const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getProfile, 
  updateProfile, 
  getAllUsers 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.post('/register', register);
router.post('/login', login);

// Rutas protegidas
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Rutas de administrador
router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;