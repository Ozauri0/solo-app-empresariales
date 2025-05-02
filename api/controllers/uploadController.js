const path = require('path');
const fs = require('fs');
const asyncHandler = require('express-async-handler');

// @desc    Subir una imagen
// @route   POST /api/upload/image
// @access  Private (Solo Admin)
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se ha subido ningún archivo'
      });
    }

    const image = req.files.image;
    
    // Validar que es una imagen
    if (!image.mimetype.startsWith('image')) {
      return res.status(400).json({
        success: false,
        message: 'El archivo debe ser una imagen'
      });
    }
    
    // Validar tamaño (5MB max)
    if (image.size > 5 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: 'La imagen no puede ser mayor a 5MB'
      });
    }

    // Crear carpeta si no existe
    // Corregir la ruta para que coincida con la configuración del servidor
    const uploadPath = path.join(__dirname, '../../public/uploads/news');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar un nombre único para el archivo
    const fileName = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(image.name)}`;
    const filePath = path.join(uploadPath, fileName);

    // Mover el archivo
    await image.mv(filePath);

    // Retornar la URL de la imagen
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/news/${fileName}`;

    res.json({
      success: true,
      imageUrl
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error al subir la imagen'
    });
  }
});

module.exports = {
  uploadImage
};