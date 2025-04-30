const News = require('../models/News');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Crear una nueva noticia
// @route   POST /api/news
// @access  Private (Solo Admin)
const createNews = asyncHandler(async (req, res) => {
  const { title, content, image, isPublished } = req.body;

  // Verificar que el usuario es administrador
  if (req.user.role !== 'admin') {
    res.status(403);
    throw new Error('No tienes permisos para crear noticias');
  }

  // Crear la noticia
  const news = await News.create({
    title,
    content,
    author: req.user._id,
    image: image || null,
    isPublished: isPublished !== undefined ? isPublished : true
  });

  res.status(201).json(news);
});

// @desc    Obtener todas las noticias publicadas
// @route   GET /api/news
// @access  Public
const getNews = asyncHandler(async (req, res) => {
  const news = await News.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .populate('author', 'name');

  res.json(news);
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

  res.json(news);
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

  res.json(news);
});

// @desc    Actualizar una noticia
// @route   PUT /api/news/:id
// @access  Private (Solo Admin)
const updateNews = asyncHandler(async (req, res) => {
  const { title, content, image, isPublished } = req.body;

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

  // Actualizar los campos
  news.title = title || news.title;
  news.content = content || news.content;
  news.image = image !== undefined ? image : news.image;
  news.isPublished = isPublished !== undefined ? isPublished : news.isPublished;
  news.updatedAt = Date.now();

  const updatedNews = await news.save();

  res.json(updatedNews);
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

  res.json({ message: 'Noticia eliminada' });
});

module.exports = {
  createNews,
  getNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews
};