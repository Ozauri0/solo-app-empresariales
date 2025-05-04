const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar si el usuario está autenticado
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar si hay token en los headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar si existe el token
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No estás autorizado para acceder a este recurso'
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener el usuario correspondiente al token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'No existe un usuario con este token'
      });
    }

    // Agregar el usuario a la request
    req.user = {
      id: user._id,
      role: user.role
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'No estás autorizado para acceder a este recurso',
      error: error.message
    });
  }
};

// Middleware para verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `El rol ${req.user.role} no está autorizado para acceder a este recurso`
      });
    }
    next();
  };
};