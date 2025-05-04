const express = require('express');
const router = express.Router();
const { uploadImage } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Ruta para subir imágenes (solo administradores)
router.post('/image', protect, authorize('admin'), uploadImage);

module.exports = router;