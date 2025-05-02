const News = require('../models/News');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Crear una nueva noticia
// @route   POST /api/news
// @access  Private (Solo Admin)
const createNews = asyncHandler(async (req, res) => {
  const { title, content, image, isVisible } = req.body;

  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para crear noticias');
  }

  // Verificar que el título existe (único campo obligatorio)
  if (!title) {
    res.status(400);
    throw new Error('El título es obligatorio');
  }

  // Si la noticia es visible, verificar si ya existe otra noticia visible
  if (isVisible) {
    const visibleNews = await News.findOne({ isVisible: true });
    
    // Si ya existe una noticia visible, retornar un error
    if (visibleNews) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una noticia visible en el dashboard. Por favor, oculta la noticia actual antes de hacer visible una nueva.',
        visibleNewsId: visibleNews._id
      });
    }
  }

  // Crear la noticia
  const news = await News.create({
    title,
    content: content || '',
    author: req.user.id, // Cambiado de req.user._id a req.user.id
    image: image || null,
    isPublished: true,
    isVisible: isVisible || false
  });

  res.status(201).json({
    success: true,
    news
  });
});

// @desc    Obtener todas las noticias publicadas
// @route   GET /api/news
// @access  Public
const getNews = asyncHandler(async (req, res) => {
  const news = await News.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .populate('author', 'name');

  res.json({
    success: true,
    news
  });
});

// @desc    Obtener la noticia visible para el dashboard
// @route   GET /api/news/visible
// @access  Public
const getVisibleNews = asyncHandler(async (req, res) => {
  const news = await News.findOne({ 
    isPublished: true, 
    isVisible: true 
  })
    .populate('author', 'name');

  res.json({
    success: true,
    news: news || null
  });
});

// @desc    Obtener todas las noticias (incluidas no publicadas)
// @route   GET /api/news/all
// @access  Private (Solo Admin)
const getAllNews = asyncHandler(async (req, res) => {
  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para ver todas las noticias');
  }

  const news = await News.find()
    .sort({ createdAt: -1 })
    .populate('author', 'name');

  res.json({
    success: true,
    news
  });
});

// @desc    Obtener una noticia por ID
// @route   GET /api/news/:id
// @access  Public (si está publicada) / Private (Admin para no publicadas)
const getNewsById = asyncHandler(async (req, res) => {
  const news = await News.findById(req.params.id)
    .populate('author', 'name');

  if (!news) {
    res.status(404);
    throw new Error('Noticia no encontrada');
  }

  // Si la noticia no está publicada, verificar que es admin
  if (!news.isPublished && (!req.user || req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('No tienes permisos para ver esta noticia');
  }

  res.json({
    success: true,
    news
  });
});

// @desc    Actualizar una noticia
// @route   PUT /api/news/:id
// @access  Private (Solo Admin)
const updateNews = asyncHandler(async (req, res) => {
  const { title, content, image, isPublished, isVisible } = req.body;

  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para actualizar noticias');
  }

  const news = await News.findById(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('Noticia no encontrada');
  }

  // Si se está cambiando la visibilidad a true, verificar que no hay otra visible
  if (isVisible && !news.isVisible) {
    const visibleNews = await News.findOne({ isVisible: true, _id: { $ne: news._id } });
    
    if (visibleNews) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una noticia visible en el dashboard. Por favor, oculta la noticia actual antes de hacer visible una nueva.',
        visibleNewsId: visibleNews._id
      });
    }
  }

  // Actualizar los campos
  news.title = title || news.title;
  news.content = content !== undefined ? content : news.content;
  news.image = image !== undefined ? image : news.image;
  news.isPublished = isPublished !== undefined ? isPublished : news.isPublished;
  news.isVisible = isVisible !== undefined ? isVisible : news.isVisible;
  news.updatedAt = Date.now();

  const updatedNews = await news.save();

  res.json({
    success: true,
    news: updatedNews
  });
});

// @desc    Cambiar visibilidad de una noticia
// @route   PUT /api/news/:id/visibility
// @access  Private (Solo Admin)
const toggleVisibility = asyncHandler(async (req, res) => {
  const { isVisible } = req.body;

  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para actualizar la visibilidad de noticias');
  }

  const news = await News.findById(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('Noticia no encontrada');
  }

  // Si se está cambiando la visibilidad a true, verificar que no hay otra visible
  if (isVisible && !news.isVisible) {
    const visibleNews = await News.findOne({ isVisible: true, _id: { $ne: news._id } });
    
    if (visibleNews) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una noticia visible en el dashboard. Por favor, oculta la noticia actual antes de hacer visible una nueva.',
        visibleNewsId: visibleNews._id
      });
    }
  }

  news.isVisible = isVisible;
  news.updatedAt = Date.now();

  const updatedNews = await news.save();

  res.json({
    success: true,
    news: updatedNews
  });
});

// @desc    Eliminar una noticia
// @route   DELETE /api/news/:id
// @access  Private (Solo Admin)
const deleteNews = asyncHandler(async (req, res) => {
  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para eliminar noticias');
  }

  const news = await News.findById(req.params.id);

  if (!news) {
    res.status(404);
    throw new Error('Noticia no encontrada');
  }

  await news.deleteOne();

  res.json({ success: true, message: 'Noticia eliminada' });
});

module.exports = {
  createNews,
  getNews,
  getVisibleNews,
  getAllNews,
  getNewsById,
  updateNews,
  toggleVisibility,
  deleteNews
};