const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
exports.register = async (req, res) => {
  try {
    const { 
      username, 
      email, 
      password, 
      name, 
      role, 
      rut,
      phone,
      address,
      studentId,
      program,
      yearOfAdmission
    } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'El correo electrónico o nombre de usuario ya está en uso' 
      });
    }

    // Crear nuevo usuario
    const user = new User({
      username,
      email,
      password,
      name,
      role,
      rut,
      phone,
      address,
      studentId,
      program,
      yearOfAdmission: yearOfAdmission || new Date().getFullYear()
    });

    await user.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al registrar el usuario',
      error: error.message
    });
  }
};

// Iniciar sesión
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Verificar si el usuario existe
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Verificar contraseña
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas'
      });
    }

    // Actualizar sesión activa
    const userAgent = req.headers['user-agent'] || 'Dispositivo desconocido';
    const newSession = {
      deviceType: detectDeviceType(userAgent),
      deviceName: userAgent,
      location: 'Temuco', // En producción, usar geolocalización
      lastActive: new Date()
    };

    // Agregar la sesión al usuario
    await User.findByIdAndUpdate(user._id, {
      $push: { activeSessions: newSession }
    });

    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(200).json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

// Función para detectar el tipo de dispositivo
function detectDeviceType(userAgent) {
  if (/mobile/i.test(userAgent)) return 'Móvil';
  if (/tablet/i.test(userAgent)) return 'Tablet';
  return 'Computadora';
}

// Obtener perfil de usuario
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

// Actualizar perfil de usuario
exports.updateProfile = async (req, res) => {
  try {
    const { 
      name,
      email, 
      username, 
      profileImage,
      phone,
      address,
      rut
    } = req.body;
    
    // Verificar si el correo o nombre de usuario ya está en uso
    if (email || username) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.user.id } },
          { $or: [
            { email: email },
            { username: username }
          ]}
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico o nombre de usuario ya está en uso'
        });
      }
    }
    
    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          name: name || undefined,
          email: email || undefined,
          username: username || undefined,
          profileImage: profileImage || undefined,
          phone: phone || undefined,
          address: address || undefined,
          rut: rut || undefined
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el perfil',
      error: error.message
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Obtener usuario
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña actual es incorrecta'
      });
    }
    
    // Actualizar contraseña
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cambiar la contraseña',
      error: error.message
    });
  }
};

// Cerrar sesión específica
exports.closeSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { activeSessions: { _id: sessionId } }
    });
    
    res.status(200).json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar la sesión',
      error: error.message
    });
  }
};

// Cerrar todas las sesiones
exports.closeAllSessions = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { activeSessions: [] }
    });
    
    res.status(200).json({
      success: true,
      message: 'Todas las sesiones han sido cerradas exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al cerrar las sesiones',
      error: error.message
    });
  }
};

// Obtener todos los usuarios (sólo admin)
exports.getAllUsers = async (req, res) => {
  try {
    // Añadir filtro por rol si se especifica en la query
    const filter = {};
    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter).select('-password');
    
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};

// Obtener un usuario específico por ID (sólo admin)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener el usuario',
      error: error.message
    });
  }
};

// Actualizar un usuario específico por ID (sólo admin)
exports.updateUser = async (req, res) => {
  try {
    const { 
      name,
      email, 
      username, 
      role,
      phone,
      address,
      rut,
      studentId,
      program,
      yearOfAdmission
    } = req.body;
    
    // Verificar si el correo o nombre de usuario ya está en uso
    if (email || username) {
      const existingUser = await User.findOne({
        $and: [
          { _id: { $ne: req.params.id } },
          { $or: [
            { email: email },
            { username: username }
          ]}
        ]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'El correo electrónico o nombre de usuario ya está en uso'
        });
      }
    }
    
    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { 
        $set: { 
          name: name || undefined,
          email: email || undefined,
          username: username || undefined,
          role: role || undefined,
          phone: phone || undefined,
          address: address || undefined,
          rut: rut || undefined,
          studentId: studentId || undefined,
          program: program || undefined,
          yearOfAdmission: yearOfAdmission || undefined
        } 
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al actualizar el usuario',
      error: error.message
    });
  }
};

// Eliminar un usuario específico por ID (sólo admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el usuario',
      error: error.message
    });
  }
};