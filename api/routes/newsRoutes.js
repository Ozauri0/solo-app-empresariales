const express = require('express');
const router = express.Router();
const { 
  createNews, 
  getNews, 
  getAllNews, 
  getNewsById, 
  updateNews, 
  deleteNews 
} = require('../controllers/newsController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Rutas públicas
router.get('/', getNews);

// Rutas protegidas (requieren autenticación)
// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros (:id)
router.get('/admin/all', protect, authorize('admin'), getAllNews);

// Ruta con parámetro id debe ir después de las rutas específicas
router.get('/:id', getNewsById);

router.post('/', protect, authorize('admin'), createNews);
router.put('/:id', protect, authorize('admin'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);

module.exports = router;